export type TimelineEntry = {
  date: string;
  event: string;
};

type IncidentTimelineProps = {
  timeline: TimelineEntry[];
};

export function IncidentTimeline({ timeline }: IncidentTimelineProps) {
  if (timeline.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">Timeline</h2>
      <div className="mt-6 space-y-6">
        {timeline.map((entry, idx) => (
          <div key={idx} className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {new Date(entry.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-sm leading-relaxed">{entry.event}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
