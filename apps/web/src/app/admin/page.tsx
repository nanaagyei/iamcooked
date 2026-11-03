import { MarketingLayout, SectionContainer } from "@/components/layout";
import { AdminReviewPanel } from "@/components/admin/AdminReviewPanel";
import { EmptyState } from "@/components/feedback";
import { requireAdmin } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <MarketingLayout>
      <SectionContainer>
        {!admin ? (
          <EmptyState
            title="Admin access required"
            description="This area is limited to iamcooked administrators. Contact your team lead if you need access."
          >
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </EmptyState>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">Admin review</h1>
              <p className="mt-2 text-muted-foreground">
                Review and publish AI-assisted incident summaries.
              </p>
            </header>
            <AdminReviewPanel />
          </>
        )}
      </SectionContainer>
    </MarketingLayout>
  );
}
