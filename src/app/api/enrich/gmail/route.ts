import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";

function getImapConfig() {
  return {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_ADDRESS!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
    logger: false as const,
  };
}

/**
 * Enrich dashboard with Gmail data
 * Searches for partner-related emails and extracts key information
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const partnerName = searchParams.get("partner");
  const daysBack = parseInt(searchParams.get("days") || "30");

  if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json(
      { error: "Gmail not configured" },
      { status: 500 }
    );
  }

  const client = new ImapFlow(getImapConfig());

  try {
    await client.connect();

    // Open INBOX
    await client.mailboxOpen("INBOX");

    // Calculate date range
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);

    // Search for emails
    let searchCriteria: any = { since: sinceDate };

    if (partnerName) {
      // Search for emails from/to partner domain
      searchCriteria = {
        ...searchCriteria,
        or: [
          { from: partnerName.toLowerCase() },
          { to: partnerName.toLowerCase() },
          { subject: partnerName }
        ]
      };
    }

    const messages = [];
    const messageList = await client.search(searchCriteria, { uid: true });

    // Limit to recent 50 emails
    const recentMessages = messageList.slice(-50);

    for (const uid of recentMessages) {
      const message = await client.fetchOne(uid, {
        envelope: true,
        bodyStructure: true,
        flags: true,
        internalDate: true,
      });

      if (message?.envelope) {
        messages.push({
          uid: uid,
          subject: message.envelope.subject,
          from: message.envelope.from?.[0],
          to: message.envelope.to,
          date: message.envelope.date,
          internalDate: message.internalDate,
          flags: message.flags,
          isRead: message.flags?.has('\\Seen'),
          isStarred: message.flags?.has('\\Flagged'),
          isDraft: message.flags?.has('\\Draft'),
        });
      }
    }

    // Analyze patterns
    const emailStats = analyzeEmailPatterns(messages);

    // Group by conversation threads (simplified)
    const threads = groupIntoThreads(messages);

    // Get important/starred emails
    const starredMessages = messages.filter(m => m.isStarred);

    // Get unread emails
    const unreadMessages = messages.filter(m => !m.isRead);

    return NextResponse.json({
      success: true,
      stats: emailStats,
      totalEmails: messages.length,
      threads: threads.slice(0, 10), // Top 10 threads
      starredCount: starredMessages.length,
      unreadCount: unreadMessages.length,
      recentEmails: messages.slice(0, 20), // Most recent 20
      partnerFilter: partnerName,
      dateRange: {
        from: sinceDate,
        to: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Gmail enrichment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enrich with Gmail data" },
      { status: 500 }
    );
  } finally {
    await client.logout().catch(() => {});
  }
}

function analyzeEmailPatterns(messages: any[]) {
  if (messages.length === 0) {
    return {
      totalEmails: 0,
      avgPerDay: 0,
      mostActiveDay: null,
      topSenders: [],
      responsePatterns: {},
    };
  }

  // Group by date
  const byDate: Record<string, number> = {};
  const senders: Record<string, number> = {};

  messages.forEach(msg => {
    const date = new Date(msg.date || msg.internalDate).toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;

    const sender = msg.from?.address || 'unknown';
    senders[sender] = (senders[sender] || 0) + 1;
  });

  // Find most active day
  const mostActiveDay = Object.entries(byDate).reduce((max, [date, count]) =>
    count > (max.count || 0) ? { date, count } : max,
    { date: null as string | null, count: 0 }
  );

  // Get top senders
  const topSenders = Object.entries(senders)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([email, count]) => ({ email, count }));

  // Calculate average emails per day
  const days = Object.keys(byDate).length || 1;
  const avgPerDay = messages.length / days;

  return {
    totalEmails: messages.length,
    avgPerDay: Math.round(avgPerDay * 10) / 10,
    mostActiveDay: mostActiveDay.date,
    topSenders,
    emailsByDate: byDate,
  };
}

function groupIntoThreads(messages: any[]) {
  // Simple grouping by subject (removing Re:, Fwd:, etc.)
  const threads: Record<string, any[]> = {};

  messages.forEach(msg => {
    const cleanSubject = (msg.subject || '')
      .replace(/^(Re:|Fwd:|Fw:)\s*/gi, '')
      .trim();

    if (!threads[cleanSubject]) {
      threads[cleanSubject] = [];
    }
    threads[cleanSubject].push(msg);
  });

  // Convert to array and sort by most recent
  return Object.entries(threads)
    .map(([subject, messages]) => ({
      subject,
      messageCount: messages.length,
      lastMessage: messages[0]?.date,
      participants: [...new Set(messages.flatMap(m => [
        m.from?.address,
        ...(m.to || []).map((t: any) => t.address)
      ].filter(Boolean)))],
      messages: messages.slice(0, 5), // Keep only recent 5
    }))
    .sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime());
}