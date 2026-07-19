import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100",
        secondary: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        outline: "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning:
          "border-transparent bg-gradient-to-r from-accent-400 to-accent-500 text-white shadow-sm dark:from-accent-500 dark:to-accent-600",
        destructive: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
