import { ArrowRight, ArrowSquareOut, Skull } from "@phosphor-icons/react/dist/ssr";
import { SeverityBadge } from "@/components/badges";
import { Badge } from "@/components/ui/badge";
import { CopyCommand } from "./CopyCommand";
import type { CheckFinding } from "./types";

export function FindingRow({ finding }: { finding: CheckFinding }) {
  const malware = finding.kind === "MALWARE";
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        {malware ? (
          <Badge className="border-severity-critical/30 bg-severity-critical/15 text-severity-critical" variant="outline">
            <Skull className="mr-1 h-3.5 w-3.5" weight="bold" aria-hidden /> Malware
          </Badge>
        ) : (
          <SeverityBadge severity={finding.severity} />
        )}
        <span className="font-mono text-sm font-semibold">{finding.packageName}</span>
        <span className="font-mono text-xs text-muted-foreground">{finding.installedVersion}</span>
        {finding.fixedVersion && (
          <span className="inline-flex items-center gap-1 font-mono text-xs text-severity-safe">
            <ArrowRight className="h-3 w-3" weight="bold" aria-hidden /> {finding.fixedVersion}
          </span>
        )}
        {finding.inCisaKev && (
          <Badge variant="outline" className="border-severity-critical/30 bg-severity-critical/10 text-severity-critical">
            Actively exploited
          </Badge>
        )}
        {finding.via.map((v) => (
          <Badge key={v} variant="outline" className="font-mono text-[11px]">
            {v.replace(/^mcp:/, "server: ")}
          </Badge>
        ))}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{finding.summary}</p>
      <p className="mt-1 text-sm text-muted-foreground">{finding.fixInstruction}</p>
      {finding.fixCommand && <CopyCommand command={finding.fixCommand} className="mt-3" />}
      <a
        href={finding.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {[finding.cve, finding.id].filter(Boolean).join(" · ")}
        <ArrowSquareOut className="h-3 w-3" aria-hidden />
      </a>
    </li>
  );
}
