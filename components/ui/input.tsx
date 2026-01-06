import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-sm border border-[#8A8886] bg-background px-3 py-1.5 text-[15px] text-[#323130] transition-colors file:border-0 file:bg-transparent file:text-[15px] file:font-medium file:text-foreground placeholder:text-[#A19F9D] focus-visible:outline-none focus-visible:border-[#0078D4] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
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
