import { SourceBadge } from "@/components/badges";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

export type IncidentSourceItem = {
  id: string;
  source: {
    name: string;
    url: string;
    title?: string | null;
    sourceType: string;
  };
};

type SourceListProps = {
  sources: IncidentSourceItem[];
};

export function SourceList({ sources }: SourceListProps) {
  return (
    <div className="mt-6 space-y-3">
      {sources.map((item) => (
        <div
          key={item.id}
          className="rounded-[1.25rem] bg-card/60 p-4 ring-1 ring-border/50"
        >
          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
          >
            {item.source.name}
            <ArrowSquareOut className="h-3 w-3 shrink-0" weight="bold" />
          </a>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {item.source.title}
          </p>
          <div className="mt-2">
            <SourceBadge name={item.source.name} sourceType={item.source.sourceType} />
          </div>
        </div>
      ))}
    </div>
  );
}
