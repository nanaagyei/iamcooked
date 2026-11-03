import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface ActionItem {
  action?: string;
  title?: string;
  command?: string;
  urgency: string;
}

const urgencyIcon = {
  immediate: AlertTriangle,
  soon: Clock,
  "when-possible": Clock,
  monitor: Clock,
} as const;

export function ActionChecklist({ items }: { items: ActionItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-semibold tracking-tight">Action plan</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) => {
          const label = item.action ?? item.title ?? "Review finding";
          const Icon = urgencyIcon[item.urgency as keyof typeof urgencyIcon] ?? CheckCircle2;
          return (
            <li key={i} className="flex items-start gap-3 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p>{label}</p>
                {item.command && (
                  <code className="mt-1 block rounded-md bg-muted px-2 py-1 font-mono text-xs">
                    {item.command}
                  </code>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
