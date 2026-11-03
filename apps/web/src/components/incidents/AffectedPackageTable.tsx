import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface AffectedPackage {
  packageName: string;
  ecosystem: string;
  affectedVersions?: string;
  patchedVersions?: string;
}

interface AffectedPackageTableProps {
  packages: AffectedPackage[];
  className?: string;
}

export function AffectedPackageTable({
  packages,
  className,
}: AffectedPackageTableProps) {
  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        No affected packages listed.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_1fr]">
        <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
          Package
        </div>
        <div className="hidden sm:block px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
          Version info
        </div>

        {packages.map((pkg, index) => (
          <div
            key={`${pkg.packageName}-${index}`}
            className={cn(
              "contents",
              index < packages.length - 1 && "[&>div]:border-b [&>div]:border-border/50",
            )}
          >
            <div className="px-5 py-3 flex items-center gap-2">
              <span className="font-mono text-sm text-foreground">
                {pkg.packageName}
              </span>
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-wider bg-muted border-border text-muted-foreground"
              >
                {pkg.ecosystem}
              </Badge>
            </div>
            <div className="px-5 py-3 text-sm text-muted-foreground">
              {pkg.affectedVersions && (
                <span className="block">
                  <span className="text-severity-high">Affected: </span>
                  {pkg.affectedVersions}
                </span>
              )}
              {pkg.patchedVersions && (
                <span className="block">
                  <span className="text-severity-safe">Patched: </span>
                  {pkg.patchedVersions}
                </span>
              )}
              {!pkg.affectedVersions && !pkg.patchedVersions && (
                <span>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
