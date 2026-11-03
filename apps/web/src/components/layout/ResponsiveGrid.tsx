import { cn } from "@/lib/utils";

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3;
}

export function ResponsiveGrid({ className, cols = 3, ...props }: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        "grid-cols-1",
        cols >= 2 && "sm:grid-cols-2",
        cols >= 3 && "lg:grid-cols-3",
        className,
      )}
      {...props}
    />
  );
}
