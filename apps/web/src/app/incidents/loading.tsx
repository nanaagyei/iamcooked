import { SectionContainer } from "@/components/layout";
import { IncidentCardSkeleton } from "@/components/feedback";

export default function IncidentsLoading() {
  return (
    <SectionContainer className="py-12">
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <IncidentCardSkeleton key={i} />
        ))}
      </div>
    </SectionContainer>
  );
}
