/**
 * Intelligence Briefing System
 * Smart relevance scoring and daily briefing generation
 */

export type BriefingPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "FYI"

export type BriefingSource = "email" | "slack" | "airtable" | "granola" | "calendar" | "external"

export type BriefingCategory =
  | "legal_contract"    // MSA, DPA, legal involvement
  | "deal_movement"     // Stage changes, momentum
  | "action_required"   // Needs response/decision
  | "meeting"          // Today's meetings or follow-ups
  | "opportunity"      // New or heating up
  | "at_risk"         // Cooling or stalled
  | "update"          // General updates

export interface BriefingItem {
  id: string
  briefingId: string
  timestamp: Date
  source: BriefingSource
  category: BriefingCategory
  priority: BriefingPriority
  relevanceScore: number  // 0-100

  // Content
  title: string
  summary: string
  details?: string

  // Context
  partnerName?: string
  partnerId?: string
  partnerStage?: string
  partnerScale?: string  // From Airtable research

  // Signals that influenced scoring
  signals: {
    hasLegalInvolvement?: boolean
    mentionsNadine?: boolean
    contractType?: "NDA" | "MSA" | "DPA" | "Amendment"
    emailResponseTime?: number  // Your avg response time in hours
    emailThreadLength?: number
    emailFrequency?: number  // Emails per week
    dealValue?: string
    isOverdue?: boolean
    daysOverdue?: number
    isTimeSensitive?: boolean
    deadline?: Date
  }

  // Links and references
  links?: {
    type: "email" | "document" | "slack" | "meeting" | "external"
    url: string
    label: string
  }[]

  // Metadata
  rawContent?: string  // Original content for reference
  createdAt: Date
}

export interface DailyBriefing {
  id: string
  date: string  // YYYY-MM-DD
  generatedAt: Date

  // Summary stats
  stats: {
    totalItems: number
    criticalItems: number
    highPriorityItems: number
    partnersActive: number
    followUpsDue: number
  }

  // Grouped items
  sections: {
    critical: BriefingItem[]       // Legal, urgent matters
    highVelocity: BriefingItem[]   // Fast-moving deals
    opportunities: BriefingItem[]   // New or heating up
    timeSensitive: BriefingItem[]  // Today's items
    atRisk: BriefingItem[]         // Needs attention
    updates: BriefingItem[]        // General updates
  }

  // AI-generated summary
  executiveSummary?: string
  keyTakeaways?: string[]
  suggestedActions?: string[]
}

export interface PartnerSignals {
  partnerId: string
  partnerName: string

  // Opportunity size (from Airtable research)
  companyScale?: string  // "100M MAU", "$2B revenue"
  scaledScore: number    // Normalized 0-100
  likelihood: "Low" | "Med" | "High"
  priority: "Low" | "Med" | "High"

  // Email engagement patterns
  avgEmailResponseTime: number  // Your avg response in hours
  lastEmailResponseTime: number
  emailFrequency: number  // Emails per week
  threadLength: number    // Current conversation length
  lastContact: Date

  // Legal/Contract status
  hasLegalInvolvement: boolean
  contractStatus?: string
  lastLegalUpdate?: Date
  nadineInvolved: boolean

  // Deal momentum
  currentStage: string
  daysInStage: number
  recentStageChange: boolean
  lastActivity: Date
  isStalled: boolean

  // Meeting patterns
  recentMeetings: number  // Last 7 days
  upcomingMeetings: number  // Next 7 days
  meetingFrequency: number  // Per month
}

/**
 * Calculate relevance score based on multiple signals
 */
export function calculateRelevanceScore(
  item: Partial<BriefingItem>,
  signals?: PartnerSignals
): number {
  let score = 0

  // CRITICAL: Legal involvement (40+ points)
  if (item.signals?.mentionsNadine) {
    score += 45  // Nadine = always critical
  }
  if (item.signals?.hasLegalInvolvement) {
    score += 35
  }
  if (item.signals?.contractType === "MSA" || item.signals?.contractType === "DPA") {
    score += 40
  }

  // HIGH: Engagement velocity (up to 35 points)
  if (signals) {
    if (signals.avgEmailResponseTime < 2) {
      score += 20  // You respond quickly = important
    } else if (signals.avgEmailResponseTime < 4) {
      score += 15
    }

    if (signals.emailFrequency > 5) {
      score += 15  // High email frequency
    } else if (signals.emailFrequency > 2) {
      score += 10
    }
  }

  // MEDIUM: Opportunity size (up to 30 points)
  if (signals?.scaledScore) {
    score += Math.floor(signals.scaledScore * 0.3)  // Up to 30 points
  }

  // Deal momentum (up to 25 points)
  if (signals?.recentStageChange) {
    score += 15
  }
  if (signals?.currentStage && ["Negotiating", "Integrating", "Meeting Booked"].includes(signals.currentStage)) {
    score += 10
  }

  // Time sensitivity (up to 20 points)
  if (item.signals?.isTimeSensitive) {
    score += 20
  }
  if (item.signals?.isOverdue) {
    score += 25  // Overdue is more urgent
    if (item.signals.daysOverdue && item.signals.daysOverdue > 3) {
      score += 10  // Very overdue
    }
  }

  // Pattern matching - quick responses mean important
  if (signals && signals.lastEmailResponseTime < 1 && signals.avgEmailResponseTime < 2) {
    score += 15  // You consistently respond fast
  }

  return Math.min(score, 100)
}

/**
 * Determine priority based on score and category
 */
export function determinePriority(
  score: number,
  category: BriefingCategory
): BriefingPriority {
  // Legal always gets elevated priority
  if (category === "legal_contract" && score > 50) {
    return "CRITICAL"
  }

  if (score >= 80) return "CRITICAL"
  if (score >= 60) return "HIGH"
  if (score >= 40) return "MEDIUM"
  if (score >= 20) return "LOW"
  return "FYI"
}

/**
 * Parse scale values from text (e.g., "100M MAU" -> 100000000)
 */
export function parseScaleValue(scale?: string): number {
  if (!scale) return 0

  const match = scale.match(/(\d+(?:\.\d+)?)\s*([BMK])?/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const multiplier = match[2]?.toUpperCase()

  switch (multiplier) {
    case 'B': return value * 1_000_000_000
    case 'M': return value * 1_000_000
    case 'K': return value * 1_000
    default: return value
  }
}

/**
 * Normalize scale to 0-100 score
 */
export function normalizeScaleScore(value: number): number {
  if (value >= 1_000_000_000) return 100  // 1B+
  if (value >= 500_000_000) return 90     // 500M+
  if (value >= 100_000_000) return 80     // 100M+
  if (value >= 50_000_000) return 70      // 50M+
  if (value >= 10_000_000) return 60      // 10M+
  if (value >= 5_000_000) return 50       // 5M+
  if (value >= 1_000_000) return 40       // 1M+
  return 30
}

/**
 * Detect legal involvement from content
 */
export function detectLegalInvolvement(content: string): {
  hasLegal: boolean
  mentionsNadine: boolean
  contractType?: string
  isUrgent: boolean
} {
  const lower = content.toLowerCase()

  const legalTerms = ["msa", "dpa", "nda", "master service", "data processing",
                      "amendment", "addendum", "redline", "legal", "contract",
                      "terms", "agreement", "signature", "execute"]

  const urgentTerms = ["urgent", "asap", "eod", "today", "immediately",
                       "signature needed", "approval needed", "blocking"]

  const contractTypes = {
    "MSA": ["msa", "master service"],
    "DPA": ["dpa", "data processing"],
    "NDA": ["nda", "non-disclosure"],
    "Amendment": ["amendment", "addendum"]
  }

  let detectedType: string | undefined
  for (const [type, terms] of Object.entries(contractTypes)) {
    if (terms.some(term => lower.includes(term))) {
      detectedType = type
      break
    }
  }

  return {
    hasLegal: legalTerms.some(term => lower.includes(term)),
    mentionsNadine: lower.includes("nadine"),
    contractType: detectedType,
    isUrgent: urgentTerms.some(term => lower.includes(term))
  }
}

/**
 * Format briefing item for display
 */
export function formatBriefingItem(item: BriefingItem): {
  icon: string
  color: string
  badge: string
} {
  const icons = {
    legal_contract: "⚖️",
    deal_movement: "📈",
    action_required: "🎯",
    meeting: "📅",
    opportunity: "💡",
    at_risk: "⚠️",
    update: "📊"
  }

  const colors = {
    CRITICAL: "text-red-600",
    HIGH: "text-orange-500",
    MEDIUM: "text-yellow-500",
    LOW: "text-blue-500",
    FYI: "text-gray-500"
  }

  const badges = {
    email: "Email",
    slack: "Slack",
    airtable: "Pipeline",
    granola: "Meeting",
    calendar: "Calendar",
    external: "External"
  }

  return {
    icon: icons[item.category] || "📌",
    color: colors[item.priority] || "text-gray-500",
    badge: badges[item.source] || item.source
  }
}