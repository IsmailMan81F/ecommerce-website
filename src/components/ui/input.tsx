import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] px-4 py-2 text-[14px] text-[var(--ink)] placeholder:text-[var(--mid-gray)] transition-colors focus-visible:outline-none focus-visible:border-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
