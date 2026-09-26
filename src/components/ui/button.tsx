import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-[18px] text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none border-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink-soft)] text-[var(--paper)] hover:bg-[var(--ink)] active:bg-black",
        secondary:
          "bg-[var(--paper)] text-[var(--ink)] border border-[var(--hairline)] hover:bg-[var(--surface-alt)] active:bg-[var(--canvas)]",
        outline:
          "border border-[var(--hairline)] bg-transparent text-[var(--ink)] hover:bg-[var(--paper)] hover:border-[var(--mid-gray)]",
        ghost:
          "bg-transparent text-[var(--ink)] hover:bg-[var(--surface-alt)] active:bg-[var(--canvas)]",
        destructive:
          "bg-[var(--ember)] text-white hover:bg-[#d0000a] active:bg-[#b80009]",
        destructiveOutline:
          "border border-[var(--ember)]/30 text-[var(--ember)] bg-transparent hover:bg-[var(--ember)]/10",
        link: "text-[var(--ink)] underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 text-[13px] rounded-[18px]",
        lg: "h-12 px-8 text-[15px] rounded-[18px]",
        icon: "h-10 w-10 p-0 rounded-full",
        iconSm: "h-8 w-8 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
