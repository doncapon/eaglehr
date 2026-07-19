import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none text-gray-700 dark:text-gray-300", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";
