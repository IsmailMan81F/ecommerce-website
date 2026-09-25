import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[90px] w-full rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] px-4 py-3 text-[14px] text-[var(--ink)] placeholder:text-[var(--mid-gray)] transition-colors focus-visible:outline-none focus-visible:border-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
