import { MainLayout } from "@/components/layout/sidebar"

export default function DraftsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="text-muted-foreground">
            AI-powered outreach draft generation
          </p>
        </div>

        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Your existing email templates are preserved and will be enhanced with AI in Session 5.
            The current cold outreach template and follow-up logic remain intact.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}