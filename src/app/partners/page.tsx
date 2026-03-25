"use client"

import { MainLayout } from "@/components/layout/sidebar"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Plus, Search } from "lucide-react"

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

// Stage colors
const STAGE_COLORS = {
  "Prospecting": "secondary",
  "To Do": "secondary",
  "Outreach Sent": "warning",
  "Meeting Booked": "warning",
  "Negotiating": "warning",
  "Integrating": "success",
  "Live - Crawl": "success",
  "Live": "success",
  "Paused": "secondary",
  "Not Interested": "destructive",
  "Dead": "destructive"
} as const

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    // TODO: Fetch partners from Airtable
    // For now, using mock data
    setPartners([
      {
        id: "1",
        Name: "Nimbus",
        Category: "App",
        "Surface Type": "In-App",
        Stage: "Integrating",
        Priority: "High",
        Likelihood: "High",
        Owner: "Langdon Miller",
        "Last Activity Date": "2024-03-20"
      },
      {
        id: "2",
        Name: "Washington Post",
        Category: "RMN Onsite",
        "Surface Type": "Web",
        Stage: "Meeting Booked",
        Priority: "High",
        Likelihood: "Med",
        Owner: "Ben Balbona",
        "Last Activity Date": "2024-03-19"
      },
      {
        id: "3",
        Name: "Clear Channel",
        Category: "DOOH",
        "Surface Type": "DOOH",
        Stage: "Negotiating",
        Priority: "Med",
        Likelihood: "High",
        Owner: "Langdon Miller",
        "Last Activity Date": "2024-03-18"
      },
      {
        id: "4",
        Name: "United Airlines",
        Category: "Travel Media",
        "Surface Type": "In-App",
        Stage: "Prospecting",
        Priority: "High",
        Likelihood: "Med",
        Owner: "Jack",
        "Last Activity Date": "2024-03-15"
      },
      {
        id: "5",
        Name: "Walmart",
        Category: "RMN Onsite",
        "Surface Type": "Web",
        Stage: "Prospecting",
        Priority: "High",
        Likelihood: "Low",
        Owner: "Adrienne Ross",
        "Last Activity Date": "2024-03-10"
      }
    ])
    setLoading(false)
  }, [])

  // Filter partners based on search and filters
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = searchTerm === "" ||
      partner.Name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || partner.Category === categoryFilter
    const matchesStage = stageFilter === "all" || partner.Stage === stageFilter
    const matchesOwner = ownerFilter === "all" || partner.Owner === ownerFilter
    const matchesPriority = priorityFilter === "all" || partner.Priority === priorityFilter

    return matchesSearch && matchesCategory && matchesStage && matchesOwner && matchesPriority
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading partners...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
            <p className="text-muted-foreground">
              Manage partnership pipeline
            </p>
          </div>
          <Link href="/partners/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="App">App</SelectItem>
              <SelectItem value="DOOH">DOOH</SelectItem>
              <SelectItem value="RMN Onsite">RMN Onsite</SelectItem>
              <SelectItem value="WiFi Portal">WiFi Portal</SelectItem>
              <SelectItem value="Travel Media">Travel Media</SelectItem>
              <SelectItem value="Onsite/Offsite">Onsite/Offsite</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
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

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              <SelectItem value="Langdon Miller">Langdon</SelectItem>
              <SelectItem value="Ben Balbona">Ben</SelectItem>
              <SelectItem value="Jack">Jack</SelectItem>
              <SelectItem value="Adrienne Ross">Adrienne</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Med">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Partners Table */}
        <div className="rounded-lg border">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Surface Type</th>
                <th className="text-left p-4 font-medium">Stage</th>
                <th className="text-left p-4 font-medium">Priority</th>
                <th className="text-left p-4 font-medium">Owner</th>
                <th className="text-left p-4 font-medium">Likelihood</th>
                <th className="text-left p-4 font-medium">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    No partners found
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/partners/${partner.id}`}
                  >
                    <td className="p-4 font-medium">{partner.Name}</td>
                    <td className="p-4">
                      <Badge variant={CATEGORY_COLORS[partner.Category as keyof typeof CATEGORY_COLORS] || "secondary"}>
                        {partner.Category}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{partner["Surface Type"]}</td>
                    <td className="p-4">
                      <Badge variant={STAGE_COLORS[partner.Stage as keyof typeof STAGE_COLORS] || "secondary"}>
                        {partner.Stage}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        partner.Priority === "High" ? "destructive" :
                        partner.Priority === "Med" ? "warning" : "secondary"
                      }>
                        {partner.Priority}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">{partner.Owner.split(" ")[0]}</td>
                    <td className="p-4">
                      <Badge variant={
                        partner.Likelihood === "High" ? "success" :
                        partner.Likelihood === "Med" ? "warning" : "secondary"
                      }>
                        {partner.Likelihood}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {partner["Last Activity Date"] || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredPartners.length} of {partners.length} partners
        </div>
      </div>
    </MainLayout>
  )
}