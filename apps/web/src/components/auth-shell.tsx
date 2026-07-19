import { CheckCircle2, Feather } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  tone?: "brand" | "accent";
}

const TONE_STYLES = {
  brand: {
    panel: "bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500",
    blurA: "bg-white/10",
    blurB: "bg-accent-400/20",
    subtitle: "text-brand-50",
    bulletIcon: "text-brand-100",
    footer: "text-brand-100",
  },
  accent: {
    panel: "bg-gradient-to-br from-accent-800 via-accent-700 to-accent-600",
    blurA: "bg-white/10",
    blurB: "bg-brand-400/20",
    subtitle: "text-accent-50",
    bulletIcon: "text-accent-100",
    footer: "text-accent-100",
  },
} as const;

export function AuthShell({ children, title, subtitle, bullets, tone = "brand" }: AuthShellProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="grid overflow-hidden rounded-2xl border border-gray-200 shadow-glow-lg dark:border-gray-800 lg:min-h-[640px] lg:grid-cols-2">
      <div
        className={`relative hidden flex-col justify-between overflow-hidden p-10 text-white transition-colors duration-300 lg:flex ${styles.panel}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-hero-grid bg-grid-cell opacity-[0.07] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -left-16 -top-16 h-64 w-64 animate-float rounded-full blur-3xl ${styles.blurA}`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 animate-float rounded-full blur-3xl [animation-delay:2s] ${styles.blurB}`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute right-1/4 top-1/3 h-40 w-40 animate-float rounded-full blur-3xl [animation-delay:3.5s] ${styles.blurA}`}
        />

        <div className="relative z-10 flex items-center gap-2 text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 shadow-soft backdrop-blur">
            <Feather className="h-4 w-4" aria-hidden />
          </span>
          EagleHR
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
          <ul className="flex flex-col gap-3 text-sm">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${styles.bulletIcon}`} aria-hidden />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <p className={`relative z-10 text-xs ${styles.footer}`}>🇳🇬 Built for Nigerian employers and job seekers</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-12 dark:bg-gray-950 sm:px-10">{children}</div>
    </div>
  );
}
