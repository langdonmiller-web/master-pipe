import { NextRequest, NextResponse } from "next/server"
import { createRecord, TABLES } from "@/lib/airtable-v2"
import type { BriefingItem, DailyBriefing } from "@/lib/intelligence"

/**
 * Generate daily intelligence briefing from collected data
 * This processes the raw items and creates the structured briefing
 */
export async function POST(req: NextRequest) {
  try {
    const { items }: { items: BriefingItem[] } = await req.json()

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Group items by category and priority
    const critical = items.filter(i => i.priority === "CRITICAL")
    const highVelocity = items.filter(i =>
      i.category === "deal_movement" && i.priority === "HIGH"
    )
    const opportunities = items.filter(i =>
      i.category === "opportunity" && i.relevanceScore > 50
    )
    const timeSensitive = items.filter(i =>
      i.signals?.isTimeSensitive || i.signals?.isOverdue
    )
    const atRisk = items.filter(i => i.category === "at_risk")
    const updates = items.filter(i =>
      i.priority === "LOW" || i.priority === "FYI"
    )

    // Count unique partners
    const uniquePartners = new Set(items.map(i => i.partnerName).filter(Boolean))

    // Count follow-ups due
    const followUpsDue = items.filter(i => i.signals?.isOverdue).length

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(critical, highVelocity, opportunities)

    // Generate key takeaways
    const keyTakeaways = generateKeyTakeaways(items)

    // Generate suggested actions
    const suggestedActions = generateSuggestedActions(critical, timeSensitive)

    const briefing: DailyBriefing = {
      id: `brief-${today}`,
      date: today,
      generatedAt: now,
      stats: {
        totalItems: items.length,
        criticalItems: critical.length,
        highPriorityItems: items.filter(i => i.priority === "HIGH").length,
        partnersActive: uniquePartners.size,
        followUpsDue
      },
      sections: {
        critical: critical.slice(0, 5),
        highVelocity: highVelocity.slice(0, 5),
        opportunities: opportunities.slice(0, 5),
        timeSensitive: timeSensitive.slice(0, 5),
        atRisk: atRisk.slice(0, 5),
        updates: updates.slice(0, 5)
      },
      executiveSummary,
      keyTakeaways: keyTakeaways.slice(0, 5),
      suggestedActions: suggestedActions.slice(0, 5)
    }

    // Save briefing to Airtable
    await saveBriefingToAirtable(briefing)

    // TODO: If configured, send via email or Slack

    return NextResponse.json({
      success: true,
      briefing
    })
  } catch (error: any) {
    console.error("Error generating briefing:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate briefing" },
      { status: 500 }
    )
  }
}

function generateExecutiveSummary(
  critical: BriefingItem[],
  highVelocity: BriefingItem[],
  opportunities: BriefingItem[]
): string {
  const parts: string[] = []

  if (critical.length > 0) {
    const legalItems = critical.filter(i => i.category === "legal_contract")
    if (legalItems.length > 0) {
      parts.push(`${legalItems.length} legal items need immediate attention.`)
    }
  }

  if (highVelocity.length > 0) {
    const partners = [...new Set(highVelocity.map(i => i.partnerName))]
    parts.push(`${partners.join(", ")} showing strong momentum.`)
  }

  if (opportunities.length > 0) {
    parts.push(`${opportunities.length} new opportunities identified.`)
  }

  if (parts.length === 0) {
    return "No urgent items today. Pipeline is stable."
  }

  return parts.join(" ")
}

function generateKeyTakeaways(items: BriefingItem[]): string[] {
  const takeaways: string[] = []

  // Nadine mentions
  const nadineItems = items.filter(i => i.signals?.mentionsNadine)
  if (nadineItems.length > 0) {
    nadineItems.forEach(item => {
      takeaways.push(`Nadine needs input on ${item.partnerName} ${item.signals?.contractType || "contract"}`)
    })
  }

  // Overdue items
  const overdueItems = items.filter(i => i.signals?.isOverdue && i.signals.daysOverdue && i.signals.daysOverdue > 2)
  overdueItems.forEach(item => {
    takeaways.push(`${item.partnerName} follow-up is ${item.signals?.daysOverdue} days overdue`)
  })

  // Big opportunities
  const bigDeals = items.filter(i => i.partnerScale && parseFloat(i.partnerScale) > 100)
  bigDeals.forEach(item => {
    takeaways.push(`${item.partnerName} represents ${item.partnerScale} opportunity`)
  })

  return takeaways
}

function generateSuggestedActions(
  critical: BriefingItem[],
  timeSensitive: BriefingItem[]
): string[] {
  const actions: string[] = []

  // Critical legal items
  critical.forEach(item => {
    if (item.category === "legal_contract") {
      if (item.signals?.contractType === "MSA") {
        actions.push(`Review ${item.partnerName} MSA${item.signals?.mentionsNadine ? " (Nadine waiting)" : ""}`)
      } else if (item.signals?.contractType === "DPA") {
        actions.push(`Sign ${item.partnerName} DPA`)
      } else {
        actions.push(`Address ${item.partnerName} legal matter`)
      }
    }
  })

  // Time sensitive items
  timeSensitive.forEach(item => {
    if (item.signals?.isOverdue) {
      actions.push(`Follow up with ${item.partnerName}`)
    }
    if (item.category === "meeting") {
      actions.push(`Prepare for ${item.partnerName} meeting`)
    }
  })

  return actions
}

async function saveBriefingToAirtable(briefing: DailyBriefing) {
  try {
    // Create or update "Daily Briefings" table
    // Note: You'll need to create this table in Airtable first
    await createRecord("Daily Briefings", {
      "Date": briefing.date,
      "Generated At": briefing.generatedAt.toISOString(),
      "Total Items": briefing.stats.totalItems,
      "Critical Items": briefing.stats.criticalItems,
      "High Priority Items": briefing.stats.highPriorityItems,
      "Partners Active": briefing.stats.partnersActive,
      "Follow-ups Due": briefing.stats.followUpsDue,
      "Executive Summary": briefing.executiveSummary,
      "Key Takeaways": briefing.keyTakeaways?.join("\n"),
      "Suggested Actions": briefing.suggestedActions?.join("\n"),
      "Full Data": JSON.stringify(briefing)
    })
  } catch (error) {
    console.error("Failed to save briefing to Airtable:", error)
    // Don't fail the whole process if Airtable save fails
  }
}