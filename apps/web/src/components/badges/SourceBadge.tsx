import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface SourceBadgeProps {
  name: string;
  url?: string;
  sourceType: string;
  className?: string;
}

export function SourceBadge({ name, url, sourceType, className }: SourceBadgeProps) {
  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 bg-muted text-muted-foreground border-border font-normal",
        url && "hover:border-border-light cursor-pointer",
        className,
      )}
    >
      {name}
      <span className="text-[10px] uppercase opacity-50">{sourceType}</span>
      {url && <ExternalLink className="h-3 w-3" />}
    </Badge>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {badge}
      </a>
    );
  }

  return badge;
}
