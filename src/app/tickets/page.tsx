import { MainLayout } from "@/components/layout/sidebar"

export default function TicketsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Manage internal action items and tasks
          </p>
        </div>

        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Ticket management will be implemented in Session 3
          </p>
        </div>
      </div>
    </MainLayout>
  )
}