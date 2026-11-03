import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textLinkVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm font-medium transition-[color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        nav:
          "text-sm text-muted-foreground underline decoration-transparent underline-offset-4 hover:text-foreground hover:decoration-foreground/40 data-[active=true]:text-foreground data-[active=true]:decoration-primary data-[active=true]:underline",
        inline:
          "text-sm text-primary underline decoration-primary/50 underline-offset-4 hover:decoration-primary",
        muted:
          "text-sm text-muted-foreground underline decoration-transparent underline-offset-4 hover:text-foreground hover:decoration-foreground/40",
        footer:
          "text-sm text-muted-foreground underline decoration-transparent underline-offset-4 hover:text-foreground hover:decoration-foreground/50",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
      },
    },
    defaultVariants: {
      variant: "inline",
      size: "default",
    },
  },
);

export interface TextLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link>,
    VariantProps<typeof textLinkVariants> {
  active?: boolean;
}

const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, variant, size, active, ...props }, ref) => (
    <Link
      ref={ref}
      data-active={active ? "true" : undefined}
      className={cn(textLinkVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
TextLink.displayName = "TextLink";

export { TextLink, textLinkVariants };
