"use client"

import { MainLayout } from "@/components/layout/sidebar"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Briefcase
} from "lucide-react"
import { formatBriefingItem, type DailyBriefing, type BriefingItem } from "@/lib/intelligence"

// Mock data for demonstration
const MOCK_BRIEFINGS: DailyBriefing[] = [
  {
    id: "brief-2024-03-26",
    date: "2024-03-26",
    generatedAt: new Date("2024-03-26T08:00:00"),
    stats: {
      totalItems: 12,
      criticalItems: 2,
      highPriorityItems: 5,
      partnersActive: 8,
      followUpsDue: 3
    },
    sections: {
      critical: [
        {
          id: "1",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-25T16:30:00"),
          source: "email",
          category: "legal_contract",
          priority: "CRITICAL",
          relevanceScore: 95,
          title: "Vistar MSA - Redlines from Nadine",
          summary: "MSA redlines from legal need review. Nadine flagged revenue share terms as requiring your input.",
          partnerName: "Vistar",
          partnerStage: "Negotiating",
          partnerScale: "100K+ DOOH screens",
          signals: {
            hasLegalInvolvement: true,
            mentionsNadine: true,
            contractType: "MSA",
            emailResponseTime: 0.75
          },
          links: [
            {
              type: "email",
              url: "https://mail.google.com/mail/u/0/#inbox/18e7c",
              label: "View Email Thread"
            },
            {
              type: "document",
              url: "https://docs.google.com/document/d/vistar-msa-redlines",
              label: "MSA Redlines Doc"
            }
          ],
          createdAt: new Date()
        },
        {
          id: "2",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-25T17:45:00"),
          source: "slack",
          category: "legal_contract",
          priority: "CRITICAL",
          relevanceScore: 90,
          title: "Clear Channel DPA - Signature Needed Today",
          summary: "DPA approved by legal, needs signature by EOD. Wade Rifkin is waiting.",
          partnerName: "Clear Channel",
          partnerStage: "Negotiating",
          partnerScale: "500K displays, $3B company",
          signals: {
            hasLegalInvolvement: true,
            contractType: "DPA",
            isTimeSensitive: true,
            deadline: new Date("2024-03-26T17:00:00")
          },
          links: [
            {
              type: "slack",
              url: "https://kargo.slack.com/archives/C123/p1234",
              label: "Slack Thread"
            }
          ],
          createdAt: new Date()
        }
      ],
      highVelocity: [
        {
          id: "3",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-26T07:00:00"),
          source: "email",
          category: "deal_movement",
          priority: "HIGH",
          relevanceScore: 85,
          title: "Apple News - Meeting Prep (2 PM Today)",
          summary: "Kelly confirmed legal will join. They want to discuss data sharing and measurement. You typically respond to Apple News within 30 minutes.",
          partnerName: "Apple News",
          partnerStage: "Meeting Booked",
          partnerScale: "125M MAU",
          signals: {
            emailResponseTime: 0.5,
            emailThreadLength: 12,
            isTimeSensitive: true
          },
          links: [
            {
              type: "meeting",
              url: "https://calendar.google.com/event/apple-news-partnership",
              label: "Calendar Event"
            },
            {
              type: "document",
              url: "https://docs.google.com/presentation/d/apple-news-deck",
              label: "Meeting Deck"
            }
          ],
          createdAt: new Date()
        },
        {
          id: "4",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-25T14:20:00"),
          source: "email",
          category: "deal_movement",
          priority: "HIGH",
          relevanceScore: 80,
          title: "Washington Post - Accelerating Timeline",
          summary: "Replied to proposal, wants to move faster. Thread has 12 messages in last 2 days.",
          partnerName: "Washington Post",
          partnerStage: "Meeting Booked",
          partnerScale: "100M+ monthly uniques",
          signals: {
            emailResponseTime: 1.2,
            emailThreadLength: 12,
            emailFrequency: 6
          },
          links: [
            {
              type: "email",
              url: "https://mail.google.com/mail/u/0/#inbox/wapo",
              label: "Email Thread"
            }
          ],
          createdAt: new Date()
        }
      ],
      opportunities: [
        {
          id: "5",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-25T11:00:00"),
          source: "airtable",
          category: "opportunity",
          priority: "HIGH",
          relevanceScore: 75,
          title: "Walmart - First Response After 3 Weeks",
          summary: "Walmart Connect team finally responded. Interested in exploring partnership. Research shows $40B retail media market opportunity.",
          partnerName: "Walmart",
          partnerStage: "Prospecting",
          partnerScale: "150M+ monthly visitors",
          signals: {
            dealValue: "$40B market"
          },
          links: [
            {
              type: "email",
              url: "https://mail.google.com/mail/u/0/#inbox/walmart",
              label: "View Email"
            }
          ],
          createdAt: new Date()
        },
        {
          id: "6",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-25T15:30:00"),
          source: "slack",
          category: "opportunity",
          priority: "MEDIUM",
          relevanceScore: 65,
          title: "United Airlines - Warm Intro Available",
          summary: "Jack got warm intro to decision maker through industry contact.",
          partnerName: "United Airlines",
          partnerStage: "Prospecting",
          partnerScale: "100M passengers/year",
          signals: {},
          links: [
            {
              type: "slack",
              url: "https://kargo.slack.com/archives/partnerships",
              label: "Slack Message"
            }
          ],
          createdAt: new Date()
        }
      ],
      timeSensitive: [
        {
          id: "7",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-23T09:00:00"),
          source: "airtable",
          category: "action_required",
          priority: "HIGH",
          relevanceScore: 70,
          title: "Vistar - Follow-up Overdue (3 days)",
          summary: "You usually respond to Oran within 1 day. Last message was about pricing model.",
          partnerName: "Vistar",
          partnerStage: "Negotiating",
          signals: {
            isOverdue: true,
            daysOverdue: 3,
            emailResponseTime: 1
          },
          links: [],
          createdAt: new Date()
        }
      ],
      atRisk: [
        {
          id: "8",
          briefingId: "brief-2024-03-26",
          timestamp: new Date("2024-03-12T09:00:00"),
          source: "airtable",
          category: "at_risk",
          priority: "MEDIUM",
          relevanceScore: 50,
          title: "WiConnect - No Response for 14 Days",
          summary: "Deal stalling. Multiple contacts but no engagement. You were responding within hours initially.",
          partnerName: "WiConnect",
          partnerStage: "Prospecting",
          partnerScale: "Thousands of venues",
          signals: {
            isOverdue: true,
            daysOverdue: 14
          },
          links: [],
          createdAt: new Date()
        }
      ],
      updates: []
    },
    executiveSummary: "2 critical legal items need immediate attention. Apple News meeting at 2 PM requires prep. Washington Post and Walmart showing strong momentum. Vistar follow-up is overdue.",
    keyTakeaways: [
      "Nadine needs input on Vistar MSA revenue share terms",
      "Clear Channel DPA must be signed by EOD",
      "Apple News bringing legal to discuss data sharing",
      "Walmart finally engaged after 3 weeks"
    ],
    suggestedActions: [
      "Review Vistar MSA redlines before noon",
      "Sign Clear Channel DPA",
      "Prep Apple News data sharing position",
      "Respond to Vistar pricing discussion"
    ]
  },
  {
    id: "brief-2024-03-25",
    date: "2024-03-25",
    generatedAt: new Date("2024-03-25T08:00:00"),
    stats: {
      totalItems: 10,
      criticalItems: 1,
      highPriorityItems: 4,
      partnersActive: 6,
      followUpsDue: 2
    },
    sections: {
      critical: [],
      highVelocity: [],
      opportunities: [],
      timeSensitive: [],
      atRisk: [],
      updates: []
    },
    executiveSummary: "Monday briefing - Week starting with strong momentum on Apple News and Washington Post deals.",
    keyTakeaways: [],
    suggestedActions: []
  }
]

export default function IntelligencePage() {
  const [selectedBriefing, setSelectedBriefing] = useState<DailyBriefing | null>(null)
  const [briefings, setBriefings] = useState<DailyBriefing[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Load briefings - in production this would fetch from Airtable/API
    setBriefings(MOCK_BRIEFINGS)
    setSelectedBriefing(MOCK_BRIEFINGS[0])
    setLoading(false)
  }, [])

  const handleGenerateNew = async () => {
    setGenerating(true)
    // TODO: Call API to generate new briefing
    setTimeout(() => {
      setGenerating(false)
    }, 2000)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatBriefingDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today's Brief"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
  }

  const renderBriefingItem = (item: BriefingItem) => {
    const format = formatBriefingItem(item)

    return (
      <div key={item.id} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{format.icon}</span>
              <h4 className={`font-medium ${format.color}`}>
                {item.title}
              </h4>
              {item.partnerName && (
                <Badge variant="outline" className="text-xs">
                  {item.partnerName}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {format.badge}
              </Badge>
              {item.signals?.mentionsNadine && (
                <Badge variant="destructive" className="text-xs">
                  Nadine
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {item.summary}
            </p>
            {item.partnerScale && (
              <p className="text-xs text-muted-foreground mb-2">
                Scale: {item.partnerScale}
              </p>
            )}
            {item.links && item.links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {link.type === "email" && <Mail className="h-3 w-3" />}
                    {link.type === "document" && <FileText className="h-3 w-3" />}
                    {link.type === "slack" && <MessageSquare className="h-3 w-3" />}
                    {link.type === "meeting" && <Calendar className="h-3 w-3" />}
                    {link.type === "external" && <ExternalLink className="h-3 w-3" />}
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground ml-4">
            {formatDate(item.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading intelligence briefings...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Sidebar - List of briefings */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Intelligence Briefs</h2>
              <Button
                size="sm"
                onClick={handleGenerateNew}
                disabled={generating}
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Generated daily at 8:00 AM
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {briefings.map((briefing) => (
              <button
                key={briefing.id}
                onClick={() => setSelectedBriefing(briefing)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                  selectedBriefing?.id === briefing.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm">
                    {formatBriefingDate(briefing.date)}
                  </span>
                  {briefing.stats.criticalItems > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {briefing.stats.criticalItems} Critical
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{briefing.stats.totalItems} items</div>
                  <div className="flex gap-2">
                    {briefing.stats.highPriorityItems > 0 && (
                      <span>{briefing.stats.highPriorityItems} high</span>
                    )}
                    <span>{briefing.stats.partnersActive} partners</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content - Selected briefing */}
        <div className="flex-1 overflow-y-auto">
          {selectedBriefing ? (
            <div className="p-6 max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">
                    Intelligence Brief - {formatBriefingDate(selectedBriefing.date)}
                  </h1>
                  <span className="text-sm text-muted-foreground">
                    Generated {formatDate(selectedBriefing.generatedAt)}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-2xl font-bold">{selectedBriefing.stats.totalItems}</div>
                      <p className="text-xs text-muted-foreground">Total Items</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedBriefing.stats.criticalItems}
                      </div>
                      <p className="text-xs text-muted-foreground">Critical</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-2xl font-bold text-orange-500">
                        {selectedBriefing.stats.highPriorityItems}
                      </div>
                      <p className="text-xs text-muted-foreground">High Priority</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-2xl font-bold">{selectedBriefing.stats.partnersActive}</div>
                      <p className="text-xs text-muted-foreground">Active Partners</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-2xl font-bold">{selectedBriefing.stats.followUpsDue}</div>
                      <p className="text-xs text-muted-foreground">Follow-ups Due</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Executive Summary */}
              {selectedBriefing.executiveSummary && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedBriefing.executiveSummary}</p>
                    {selectedBriefing.suggestedActions && selectedBriefing.suggestedActions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Suggested Actions:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {selectedBriefing.suggestedActions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Critical Items */}
              {selectedBriefing.sections.critical.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    🔴 Critical - Requires Immediate Attention
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      {selectedBriefing.sections.critical.map(renderBriefingItem)}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* High Velocity Deals */}
              {selectedBriefing.sections.highVelocity.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    ⚡ High Velocity Deals
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      {selectedBriefing.sections.highVelocity.map(renderBriefingItem)}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Opportunities */}
              {selectedBriefing.sections.opportunities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">📈 Opportunities</h3>
                  <Card>
                    <CardContent className="pt-4">
                      {selectedBriefing.sections.opportunities.map(renderBriefingItem)}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Time Sensitive */}
              {selectedBriefing.sections.timeSensitive.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    ⏰ Time Sensitive
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      {selectedBriefing.sections.timeSensitive.map(renderBriefingItem)}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* At Risk */}
              {selectedBriefing.sections.atRisk.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-orange-600">⚠️ At Risk</h3>
                  <Card>
                    <CardContent className="pt-4">
                      {selectedBriefing.sections.atRisk.map(renderBriefingItem)}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a briefing to view
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}