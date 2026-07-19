import { Button } from "@eaglehr/ui";
import { Feather } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/session";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative py-1 text-gray-600 transition-colors hover:text-brand-700 dark:text-gray-300 dark:hover:text-brand-400">
      {children}
      <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-brand-600 transition-transform duration-200 ease-out-expo group-hover:scale-x-100 dark:bg-brand-400" />
    </Link>
  );
}

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-soft">
            <Feather className="h-4 w-4" aria-hidden />
          </span>
          EagleHR
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink href="/jobs">Find jobs</NavLink>
          <NavLink href="/companies">Companies</NavLink>
          {user ? (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              {user.isPlatformAdmin ? <NavLink href="/admin/settings">Admin</NavLink> : null}
              {user.isPlatformAdmin ? <NavLink href="/admin/verifications">Verifications</NavLink> : null}
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <NavLink href="/login">Sign in</NavLink>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
