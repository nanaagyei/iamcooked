export type CookedVerdict = {
  label: string;
  blurb: string;
  tone: "safe" | "low" | "medium" | "high" | "critical";
};

/**
 * Maps a 0-100 workspace risk score to a playful "am I cooked?" verdict.
 * The real score still drives everything underneath.
 */
export function getCookedVerdict(score: number): CookedVerdict {
  if (score >= 80) {
    return {
      label: "Burnt to a crisp",
      blurb: "Reachable critical issues in your stack. Fix these before anything else.",
      tone: "critical",
    };
  }
  if (score >= 55) {
    return {
      label: "Well done",
      blurb: "Some serious findings are live. Worth a focused afternoon of patching.",
      tone: "high",
    };
  }
  if (score >= 30) {
    return {
      label: "Getting toasty",
      blurb: "A few things to clean up, none of them on fire. You've got time.",
      tone: "medium",
    };
  }
  if (score > 0) {
    return {
      label: "Lightly toasted",
      blurb: "Minor stuff only. Knock it out whenever you touch the deps next.",
      tone: "low",
    };
  }
  return {
    label: "Not cooked",
    blurb: "Nothing risky in what we can see. Keep shipping.",
    tone: "safe",
  };
}

export const cookedToneStyles: Record<CookedVerdict["tone"], string> = {
  safe: "bg-severity-safe/15 text-severity-safe border-severity-safe/30",
  low: "bg-severity-low/15 text-severity-low border-severity-low/30",
  medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  high: "bg-severity-high/15 text-severity-high border-severity-high/30",
  critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
};

export const AGENT_VENDOR_LABELS: Record<string, string> = {
  CURSOR: "Cursor",
  CLAUDE_CODE: "Claude Code",
  LOVABLE: "Lovable",
  REPLIT: "Replit",
  V0: "v0",
  WINDSURF: "Windsurf",
  BOLT: "Bolt",
  COPILOT: "Copilot",
  OTHER: "Other agent",
};

export const AGENT_SOURCE_LABELS: Record<string, string> = {
  REPO: "Repository",
  CLOUD: "Cloud",
  LOCAL: "Local",
};

export const TASK_PROVIDER_LABELS: Record<string, string> = {
  INTERNAL: "Internal",
  GITHUB: "GitHub",
  JIRA: "Jira",
  LINEAR: "Linear",
};

export const TRIAGE_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const triageStatusStyles: Record<string, string> = {
  OPEN: "bg-severity-high/15 text-severity-high border-severity-high/30",
  IN_PROGRESS: "bg-severity-low/15 text-severity-low border-severity-low/30",
  DONE: "bg-severity-safe/15 text-severity-safe border-severity-safe/30",
};

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}
