import { MainLayout } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Partnership pipeline overview for Kargo Inventory Partnerships
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stalled Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                No activity in 14+ days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                4 high priority
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Kanban Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>
              Drag and drop to move partners between stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {["Prospecting", "Outreach Sent", "Meeting Booked", "Negotiating", "Live"].map((stage) => (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">{stage}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {Math.floor(Math.random() * 10) + 1}
                    </Badge>
                  </div>
                  <div className="space-y-2 min-h-[100px] rounded-lg border border-dashed p-2">
                    <div className="rounded-lg border bg-card p-3 text-sm shadow-sm">
                      Sample Partner
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Queue */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across all partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Stage changed: Nimbus</p>
                    <p className="text-xs text-muted-foreground">Moved to Integrating - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Outreach sent: Washington Post</p>
                    <p className="text-xs text-muted-foreground">Email to John Doe - 5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Meeting scheduled: Apple News</p>
                    <p className="text-xs text-muted-foreground">Tomorrow at 2:00 PM - 1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up Queue</CardTitle>
              <CardDescription>
                Partners requiring follow-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Vistar</p>
                    <p className="text-xs text-muted-foreground">3 days overdue</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Clear Channel</p>
                    <p className="text-xs text-muted-foreground">Due today</p>
                  </div>
                  <Badge variant="warning" className="text-xs">Today</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">United Airlines</p>
                    <p className="text-xs text-muted-foreground">Due tomorrow</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">Tomorrow</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}