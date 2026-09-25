import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[18px] border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--ink)]",
  {
    variants: {
      variant: {
        default:
          "border-[var(--hairline)] bg-[var(--surface-alt)] text-[var(--ink)]",
        secondary:
          "border-transparent bg-[var(--canvas)] text-[var(--mid-gray)]",
        outline:
          "border-[var(--hairline)] bg-transparent text-[var(--ink)]",
        solid:
          "border-transparent bg-[var(--ink)] text-[var(--paper)]",
        destructive:
          "border-transparent bg-[var(--ember)] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
