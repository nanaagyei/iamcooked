import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-[color,box-shadow,transform,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-primary/20 bg-primary text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]",
        destructive:
          "border border-destructive/20 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-border bg-muted text-foreground shadow-sm hover:border-foreground/25 hover:bg-card active:scale-[0.98]",
        contrast:
          "border border-contrast/10 bg-contrast text-contrast-foreground shadow-[0_10px_30px_-12px_rgba(20,26,23,0.45)] hover:bg-contrast/92 active:scale-[0.98]",
        secondary:
          "border border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70 active:scale-[0.98]",
        ghost:
          "border border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
        link: "border-0 bg-transparent p-0 text-primary underline decoration-primary/60 underline-offset-4 shadow-none hover:decoration-primary h-auto font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
