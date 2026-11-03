const steps = [
  {
    id: "learn",
    label: "Understand",
    description: "What we check and what you get back",
  },
  {
    id: "upload",
    label: "Upload",
    description: "Drop your lockfile",
  },
  {
    id: "report",
    label: "Report",
    description: "Risk score and action plan",
  },
];

export function ScanStepper({ activeStep = 1 }: { activeStep?: number }) {
  return (
    <ol className="mb-10 grid gap-4 sm:grid-cols-3">
      {steps.map((step, i) => (
        <li
          key={step.id}
          className={`rounded-2xl border px-4 py-3 transition-colors ${
            i === activeStep
              ? "border-primary/40 bg-primary/5"
              : "border-border/60 bg-card"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Step {i + 1}
          </p>
          <p className="mt-1 text-sm font-semibold">{step.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
