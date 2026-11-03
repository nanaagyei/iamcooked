import { cn } from "@/lib/utils";

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

export function SectionContainer({
  className,
  size = "default",
  ...props
}: SectionContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        size === "default" && "max-w-6xl",
        size === "narrow" && "max-w-4xl",
        size === "wide" && "max-w-7xl",
        className,
      )}
      {...props}
    />
  );
}
