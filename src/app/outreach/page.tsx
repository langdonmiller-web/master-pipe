import { MainLayout } from "@/components/layout/sidebar"

export default function OutreachPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outreach</h1>
          <p className="text-muted-foreground">
            Track all outreach activities across partners
          </p>
        </div>

        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Outreach tracking will be implemented in Session 2
          </p>
        </div>
      </div>
    </MainLayout>
  )
}