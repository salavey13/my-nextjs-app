// components\ui\dropdown.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex w-full rounded-md bg-transparent py-2 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-neumorphism",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Dropdown.displayName = "Dropdown";

export { Dropdown };
