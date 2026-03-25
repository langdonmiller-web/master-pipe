"use client"

import { MainLayout } from "@/components/layout/sidebar"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewPartnerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    Name: "",
    Category: "",
    "Sub Category": "",
    "Surface Type": "",
    Stage: "Prospecting",
    Priority: "Med",
    Likelihood: "Med",
    Owner: "Langdon Miller",
    Description: "",
    "Partnership Hypothesis": "",
    "Status Details & Action Items": "",
    Timeline: "",
    "Current Monetization": "",
    "Approved Formats": "",
    Scale: "",
    Materials: "",
    Pricing: "",
    Targeting: "",
    "Contract Status": "None",
    "Integration Method": "",
    Intermediary: "",
    "New Contract Point": "",
    "Spend Point": "",
    "Company Research": "",
    Website: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Call Airtable API to create partner
      console.log("Creating partner:", formData)

      // For now, just redirect back to partners page
      setTimeout(() => {
        router.push("/partners")
      }, 1000)
    } catch (error) {
      console.error("Error creating partner:", error)
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Partner</h1>
          <p className="text-muted-foreground">
            Create a new partnership opportunity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core details about the partner
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Partner Name *</Label>
                <Input
                  id="name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required
                  placeholder="e.g., Walmart, Apple News"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.Category}
                  onValueChange={(value) => setFormData({ ...formData, Category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="App">App</SelectItem>
                    <SelectItem value="DOOH">DOOH</SelectItem>
                    <SelectItem value="RMN Onsite">RMN Onsite</SelectItem>
                    <SelectItem value="WiFi Portal">WiFi Portal</SelectItem>
                    <SelectItem value="Travel Media">Travel Media</SelectItem>
                    <SelectItem value="Onsite/Offsite">Onsite/Offsite</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="surface">Surface Type *</Label>
                <Select
                  value={formData["Surface Type"]}
                  onValueChange={(value) => setFormData({ ...formData, "Surface Type": value })}
                >
                  <SelectTrigger id="surface">
                    <SelectValue placeholder="Select surface type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-App">In-App</SelectItem>
                    <SelectItem value="RMN Onsite">RMN Onsite</SelectItem>
                    <SelectItem value="WiFi Portal">WiFi Portal</SelectItem>
                    <SelectItem value="DOOH">DOOH</SelectItem>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={formData.Stage}
                  onValueChange={(value) => setFormData({ ...formData, Stage: value })}
                >
                  <SelectTrigger id="stage">
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
              </div>

              <div>
                <Label htmlFor="owner">Owner</Label>
                <Select
                  value={formData.Owner}
                  onValueChange={(value) => setFormData({ ...formData, Owner: value })}
                >
                  <SelectTrigger id="owner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Langdon Miller">Langdon Miller</SelectItem>
                    <SelectItem value="Ben Balbona">Ben Balbona</SelectItem>
                    <SelectItem value="Jack">Jack</SelectItem>
                    <SelectItem value="Adrienne Ross">Adrienne Ross</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.Priority}
                  onValueChange={(value) => setFormData({ ...formData, Priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Med">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="likelihood">Likelihood</Label>
                <Select
                  value={formData.Likelihood}
                  onValueChange={(value) => setFormData({ ...formData, Likelihood: value })}
                >
                  <SelectTrigger id="likelihood">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Med">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Partnership Details */}
          <Card>
            <CardHeader>
              <CardTitle>Partnership Details</CardTitle>
              <CardDescription>
                Strategic information about the partnership
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  placeholder="One-liner on the partnership"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="hypothesis">Partnership Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  value={formData["Partnership Hypothesis"]}
                  onChange={(e) => setFormData({ ...formData, "Partnership Hypothesis": e.target.value })}
                  placeholder="Strategic angle — why Kargo + this partner"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status Details & Action Items</Label>
                <Textarea
                  id="status"
                  value={formData["Status Details & Action Items"]}
                  onChange={(e) => setFormData({ ...formData, "Status Details & Action Items": e.target.value })}
                  placeholder="Running notes on where things stand"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.Timeline}
                    onChange={(e) => setFormData({ ...formData, Timeline: e.target.value })}
                    placeholder="e.g., Q2 2024"
                  />
                </div>

                <div>
                  <Label htmlFor="scale">Scale</Label>
                  <Input
                    id="scale"
                    value={formData.Scale}
                    onChange={(e) => setFormData({ ...formData, Scale: e.target.value })}
                    placeholder="e.g., 50M MAU"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.Website}
                    onChange={(e) => setFormData({ ...formData, Website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contract">Contract Status</Label>
                  <Select
                    value={formData["Contract Status"]}
                    onValueChange={(value) => setFormData({ ...formData, "Contract Status": value })}
                  >
                    <SelectTrigger id="contract">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="NDA Sent">NDA Sent</SelectItem>
                      <SelectItem value="NDA Signed">NDA Signed</SelectItem>
                      <SelectItem value="MSA Drafting">MSA Drafting</SelectItem>
                      <SelectItem value="MSA Redline">MSA Redline</SelectItem>
                      <SelectItem value="MSA Signed">MSA Signed</SelectItem>
                      <SelectItem value="Addendum Needed">Addendum Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
              <CardDescription>
                Integration and monetization information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="monetization">Current Monetization</Label>
                <Input
                  id="monetization"
                  value={formData["Current Monetization"]}
                  onChange={(e) => setFormData({ ...formData, "Current Monetization": e.target.value })}
                  placeholder="e.g., GAM, Prebid, TAM"
                />
              </div>

              <div>
                <Label htmlFor="formats">Approved Formats</Label>
                <Input
                  id="formats"
                  value={formData["Approved Formats"]}
                  onChange={(e) => setFormData({ ...formData, "Approved Formats": e.target.value })}
                  placeholder="What ad formats they support"
                />
              </div>

              <div>
                <Label htmlFor="integration">Integration Method</Label>
                <Input
                  id="integration"
                  value={formData["Integration Method"]}
                  onChange={(e) => setFormData({ ...formData, "Integration Method": e.target.value })}
                  placeholder="e.g., oRTB S2S, Prebid Server"
                />
              </div>

              <div>
                <Label htmlFor="intermediary">Intermediary</Label>
                <Input
                  id="intermediary"
                  value={formData.Intermediary}
                  onChange={(e) => setFormData({ ...formData, Intermediary: e.target.value })}
                  placeholder="e.g., Vistar, Kevel, Direct"
                />
              </div>

              <div>
                <Label htmlFor="pricing">Pricing</Label>
                <Input
                  id="pricing"
                  value={formData.Pricing}
                  onChange={(e) => setFormData({ ...formData, Pricing: e.target.value })}
                  placeholder="CPM or commercial terms"
                />
              </div>

              <div>
                <Label htmlFor="targeting">Targeting</Label>
                <Input
                  id="targeting"
                  value={formData.Targeting}
                  onChange={(e) => setFormData({ ...formData, Targeting: e.target.value })}
                  placeholder="Geo, audience capabilities"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/partners")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.Name || !formData.Category}>
              {loading ? "Creating..." : "Create Partner"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}