import { NextRequest, NextResponse } from "next/server"
import {
  listRecords,
  recordToPartner,
  recordToContact,
  TABLES,
  type Partner
} from "@/lib/airtable-v2"
import {
  calculateRelevanceScore,
  determinePriority,
  detectLegalInvolvement,
  parseScaleValue,
  normalizeScaleScore,
  type BriefingItem,
  type PartnerSignals
} from "@/lib/intelligence"

/**
 * Collect data from all sources for intelligence briefing
 * This runs at 8:00 AM daily
 */
export async function POST(req: NextRequest) {
  try {
    const items: BriefingItem[] = []
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // 1. Collect from Airtable Pipeline
    const partners = await listRecords(TABLES.PARTNERS, {
      filterByFormula: `OR(
        {Stage} = 'Negotiating',
        {Stage} = 'Integrating',
        {Stage} = 'Meeting Booked',
        {Last Activity Date} >= '${yesterday.toISOString().split('T')[0]}'
      )`
    })

    for (const partnerRecord of partners) {
      const partner = recordToPartner(partnerRecord)

      // Calculate partner signals
      const signals: PartnerSignals = {
        partnerId: partner.id,
        partnerName: partner.Name,
        companyScale: partner.Scale,
        scaledScore: normalizeScaleScore(parseScaleValue(partner.Scale)),
        likelihood: partner.Likelihood,
        priority: partner.Priority,
        avgEmailResponseTime: 2, // TODO: Calculate from email data
        lastEmailResponseTime: 2,
        emailFrequency: 3,
        threadLength: 5,
        lastContact: new Date(partner["Last Activity Date"] || now),
        hasLegalInvolvement: false,
        contractStatus: partner["Contract Status"],
        nadineInvolved: false,
        currentStage: partner.Stage,
        daysInStage: 7, // TODO: Calculate from timeline
        recentStageChange: false,
        lastActivity: new Date(partner["Last Activity Date"] || now),
        isStalled: partner.Stalled || false,
        recentMeetings: 0,
        upcomingMeetings: 0,
        meetingFrequency: 0
      }

      // Check for stalled deals
      if (partner.Stalled) {
        const item: BriefingItem = {
          id: `stalled-${partner.id}`,
          briefingId: "",
          timestamp: new Date(partner["Last Activity Date"] || now),
          source: "airtable",
          category: "at_risk",
          priority: "MEDIUM",
          relevanceScore: 50,
          title: `${partner.Name} - No Activity for 14+ Days`,
          summary: `Deal may be stalling. Last activity was ${partner["Last Activity Date"]}. Consider re-engaging.`,
          partnerName: partner.Name,
          partnerId: partner.id,
          partnerStage: partner.Stage,
          partnerScale: partner.Scale,
          signals: {
            isOverdue: true,
            daysOverdue: 14
          },
          links: [],
          createdAt: now
        }

        item.relevanceScore = calculateRelevanceScore(item, signals)
        item.priority = determinePriority(item.relevanceScore, item.category)
        items.push(item)
      }

      // Check for recent stage changes (would come from Timeline Events)
      // TODO: Query Timeline Events table

      // Check for contract updates
      if (partner["Contract Status"] && partner["Contract Status"] !== "None") {
        const legalCheck = detectLegalInvolvement(
          `${partner["Contract Status"]} ${partner["Status Details & Action Items"] || ""}`
        )

        if (legalCheck.hasLegal || partner["Contract Status"].includes("MSA") || partner["Contract Status"].includes("DPA")) {
          const item: BriefingItem = {
            id: `contract-${partner.id}`,
            briefingId: "",
            timestamp: new Date(partner["Last Activity Date"] || now),
            source: "airtable",
            category: "legal_contract",
            priority: "HIGH",
            relevanceScore: 70,
            title: `${partner.Name} - ${partner["Contract Status"]}`,
            summary: partner["Status Details & Action Items"] || "Contract in progress",
            partnerName: partner.Name,
            partnerId: partner.id,
            partnerStage: partner.Stage,
            partnerScale: partner.Scale,
            signals: {
              hasLegalInvolvement: true,
              contractType: legalCheck.contractType as any,
              mentionsNadine: legalCheck.mentionsNadine
            },
            links: [],
            createdAt: now
          }

          signals.hasLegalInvolvement = true
          signals.nadineInvolved = legalCheck.mentionsNadine

          item.relevanceScore = calculateRelevanceScore(item, signals)
          item.priority = determinePriority(item.relevanceScore, item.category)
          items.push(item)
        }
      }

      // Check for high-priority deals in active stages
      if (["Negotiating", "Integrating", "Meeting Booked"].includes(partner.Stage) &&
          partner.Priority === "High") {
        const item: BriefingItem = {
          id: `active-${partner.id}`,
          briefingId: "",
          timestamp: new Date(partner["Last Activity Date"] || now),
          source: "airtable",
          category: "deal_movement",
          priority: "HIGH",
          relevanceScore: 60,
          title: `${partner.Name} - ${partner.Stage}`,
          summary: partner["Status Details & Action Items"] || `Currently in ${partner.Stage} stage`,
          partnerName: partner.Name,
          partnerId: partner.id,
          partnerStage: partner.Stage,
          partnerScale: partner.Scale,
          signals: {},
          links: [],
          createdAt: now
        }

        item.relevanceScore = calculateRelevanceScore(item, signals)
        item.priority = determinePriority(item.relevanceScore, item.category)

        // Only include if relevance is high enough
        if (item.relevanceScore > 40) {
          items.push(item)
        }
      }
    }

    // 2. TODO: Collect from Gmail API
    // Query threads from last 24 hours
    // Analyze response patterns
    // Extract action items

    // 3. TODO: Collect from Slack API
    // Query relevant channels
    // Look for partner mentions
    // Extract Nadine/legal mentions

    // 4. TODO: Collect from Granola (meeting notes)
    // Get yesterday's meetings
    // Get today's upcoming meetings
    // Extract action items

    // Sort by relevance score
    items.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Limit to top 20 items to avoid overload
    const topItems = items.slice(0, 20)

    return NextResponse.json({
      success: true,
      itemCount: topItems.length,
      items: topItems,
      collectedAt: now
    })
  } catch (error: any) {
    console.error("Error collecting intelligence data:", error)
    return NextResponse.json(
      { error: error.message || "Failed to collect intelligence data" },
      { status: 500 }
    )
  }
}