import { cn } from "../lib/cn";
import { Badge } from "./badge";

interface PackageBadgeProps {
  name: string;
  version?: string;
  ecosystem?: string;
  className?: string;
}

export function PackageBadge({ name, version, ecosystem, className }: PackageBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-xs bg-muted border-border text-foreground",
        className,
      )}
    >
      {name}
      {version && <span className="ml-1 text-muted-foreground">@{version}</span>}
      {ecosystem && (
        <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          {ecosystem}
        </span>
      )}
    </Badge>
  );
}
