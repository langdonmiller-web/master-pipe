"use client"

import { MainLayout } from "@/components/layout/sidebar"
import { useState, useEffect, use } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Calendar, DollarSign, FileText, Globe, Users } from "lucide-react"

// Category colors mapping
const CATEGORY_COLORS = {
  "App": "app",
  "DOOH": "dooh",
  "RMN Onsite": "rmn",
  "WiFi Portal": "wifi",
  "Travel Media": "travel",
  "Onsite/Offsite": "onsite",
  "Other": "other"
} as const

// Mock data - replace with actual Airtable fetch
const MOCK_PARTNER = {
  id: "1",
  Name: "Nimbus",
  Category: "App",
  "Sub Category": "Weather",
  "Surface Type": "In-App",
  Stage: "Integrating",
  Priority: "High",
  Likelihood: "High",
  Owner: "Langdon Miller",
  Description: "Weather app with location-based inventory",
  "Partnership Hypothesis": "High-value location-based audiences for automotive and retail brands. Their weather-triggered contextual targeting could be valuable for seasonal campaigns.",
  "Status Details & Action Items": "Tech integration in progress. Testing ad serving with their team. Need to schedule QA session next week.",
  Timeline: "Q1 2024",
  "Current Monetization": "GAM, Prebid",
  "Approved Formats": "Banner, Interstitial, Native",
  Scale: "50M MAU",
  Materials: "https://docs.google.com/presentation/d/nimbus-partnership",
  Pricing: "$5-15 CPM depending on targeting",
  Targeting: "Geo, Weather conditions, Time of day",
  "Contract Status": "MSA Signed",
  "Integration Method": "Prebid Server",
  Intermediary: "Direct",
  "New Contract Point": "Q1 2024",
  "Spend Point": "Q2 2024",
  "Company Research": "Founded 2015, leading weather app with strong presence in US market",
  Website: "https://nimbus.com",
  Stalled: false,
  "Last Activity Date": "2024-03-20"
}

type Props = {
  params: Promise<{ id: string }>
}

export default function PartnerDetailPage({ params }: Props) {
  const resolvedParams = use(params)
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<any>({})

  useEffect(() => {
    // TODO: Fetch partner from Airtable using resolvedParams.id
    // For now, using mock data
    setPartner(MOCK_PARTNER)
    setLoading(false)
  }, [resolvedParams.id])

  const handleStageChange = async (newStage: string) => {
    // TODO: Update in Airtable and create timeline event
    setPartner({ ...partner, Stage: newStage })
  }

  const handleEdit = (field: string) => {
    setEditing(field)
    setEditValues({ [field]: partner[field] || "" })
  }

  const handleSave = async (field: string) => {
    // TODO: Save to Airtable
    setPartner({ ...partner, [field]: editValues[field] })
    setEditing(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValues({})
  }

  const daysSinceActivity = partner?.["Last Activity Date"]
    ? Math.floor((Date.now() - new Date(partner["Last Activity Date"]).getTime()) / (1000 * 60 * 60 * 24))
    : null

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading partner details...</p>
        </div>
      </MainLayout>
    )
  }

  if (!partner) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Partner not found</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{partner.Name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={CATEGORY_COLORS[partner.Category as keyof typeof CATEGORY_COLORS] || "secondary"}>
                {partner.Category}
              </Badge>
              <Select value={partner.Stage} onValueChange={handleStageChange}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospecting">Prospecting</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="Outreach Sent">Outreach Sent</SelectItem>
                  <SelectItem value="Meeting Booked">Meeting Booked</SelectItem>
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                  <SelectItem value="Integrating">Integrating</SelectItem>
                  <SelectItem value="Live - Crawl">Live - Crawl</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Dead">Dead</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={partner.Priority === "High" ? "destructive" : partner.Priority === "Med" ? "warning" : "secondary"}>
                {partner.Priority} Priority
              </Badge>
              <span className="text-sm text-muted-foreground">
                Owner: {partner.Owner}
              </span>
              {partner.Stalled && (
                <Badge variant="warning">Stalled</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Partnership Details */}
            <Card>
              <CardHeader>
                <CardTitle>Partnership Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Partnership Hypothesis */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Partnership Hypothesis</label>
                    {editing === "Partnership Hypothesis" ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button size="sm" onClick={() => handleSave("Partnership Hypothesis")}>Save</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleEdit("Partnership Hypothesis")}>
                        Edit
                      </Button>
                    )}
                  </div>
                  {editing === "Partnership Hypothesis" ? (
                    <Textarea
                      value={editValues["Partnership Hypothesis"]}
                      onChange={(e) => setEditValues({ "Partnership Hypothesis": e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {partner["Partnership Hypothesis"] || "No hypothesis provided"}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {partner.Description || "No description provided"}
                  </p>
                </div>

                {/* Status Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Status Details & Action Items</label>
                    {editing === "Status Details & Action Items" ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button size="sm" onClick={() => handleSave("Status Details & Action Items")}>Save</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleEdit("Status Details & Action Items")}>
                        Edit
                      </Button>
                    )}
                  </div>
                  {editing === "Status Details & Action Items" ? (
                    <Textarea
                      value={editValues["Status Details & Action Items"]}
                      onChange={(e) => setEditValues({ "Status Details & Action Items": e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {partner["Status Details & Action Items"] || "No status details"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Technical & Commercial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Integration Method</label>
                    <p className="text-sm text-muted-foreground">
                      {partner["Integration Method"] || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Intermediary</label>
                    <p className="text-sm text-muted-foreground">
                      {partner.Intermediary || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current Monetization</label>
                    <p className="text-sm text-muted-foreground">
                      {partner["Current Monetization"] || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Approved Formats</label>
                    <p className="text-sm text-muted-foreground">
                      {partner["Approved Formats"] || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Scale</label>
                    <p className="text-sm text-muted-foreground">
                      {partner.Scale || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pricing</label>
                    <p className="text-sm text-muted-foreground">
                      {partner.Pricing || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Targeting</label>
                    <p className="text-sm text-muted-foreground">
                      {partner.Targeting || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timeline</label>
                    <p className="text-sm text-muted-foreground">
                      {partner.Timeline || "—"}
                    </p>
                  </div>
                </div>

                {/* Links */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  {partner.Materials && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={partner.Materials}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Materials & Specs
                      </a>
                    </div>
                  )}
                  {partner.Website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={partner.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {partner.Website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Days Since Activity</span>
                    <span className="text-2xl font-bold">
                      {daysSinceActivity !== null ? daysSinceActivity : "—"}
                    </span>
                  </div>
                  {daysSinceActivity !== null && daysSinceActivity > 14 && (
                    <p className="text-xs text-warning mt-1">No activity in 14+ days</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contract Status</span>
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {partner["Contract Status"]}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Likelihood</span>
                  </div>
                  <Badge
                    variant={partner.Likelihood === "High" ? "success" : partner.Likelihood === "Med" ? "warning" : "secondary"}
                    className="mt-1"
                  >
                    {partner.Likelihood}
                  </Badge>
                </div>

                {partner["Spend Point"] && (
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Spend Point</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{partner["Spend Point"]}</p>
                  </div>
                )}

                {partner["New Contract Point"] && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Contract Target</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{partner["New Contract Point"]}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>More Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Additional tabs will be added:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Contacts (Session 2)</li>
                    <li>Outreach (Session 2)</li>
                    <li>Tickets (Session 3)</li>
                    <li>Timeline (Session 3)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}