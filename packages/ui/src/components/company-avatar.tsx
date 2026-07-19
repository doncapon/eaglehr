import { cn } from "../lib/cn";

export interface CompanyAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 rounded-md text-xs",
  md: "h-12 w-12 rounded-lg text-base",
  lg: "h-16 w-16 rounded-xl text-xl",
} as const;

export function CompanyAvatar({ name, logoUrl, size = "md", className }: CompanyAvatarProps) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className={cn("object-cover", sizeClasses[size], className)} />;
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white",
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
