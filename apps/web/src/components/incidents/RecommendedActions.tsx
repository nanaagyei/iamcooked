import { Shield } from "@phosphor-icons/react/dist/ssr";

export type RecommendedAction = {
  title: string;
  description: string;
  command?: string;
  urgency: string;
};

type RecommendedActionsProps = {
  actions: RecommendedAction[];
};

export function RecommendedActions({ actions }: RecommendedActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">What to do</h2>
      <div className="mt-6 space-y-4">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="rounded-[1.25rem] bg-muted/40 p-5 ring-1 ring-border/50"
          >
            <div className="flex gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-severity-safe" />
              <div>
                <h4 className="text-sm font-medium">{action.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                {action.command && (
                  <div className="mt-3 overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground">
                    {action.command}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
