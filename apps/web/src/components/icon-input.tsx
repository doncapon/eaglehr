import { cn, Input } from "@eaglehr/ui";
import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
}

export function IconInput({ icon: Icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  );
}
