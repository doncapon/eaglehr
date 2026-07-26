"use client";

import { Button } from "@eaglehr/ui";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/lib/auth-actions";

interface MobileNavUser {
  isPlatformAdmin: boolean;
  isJobSeeker: boolean;
  hasEmployeeRecords: boolean;
}

const linkClass =
  "rounded-md px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800";

export function MobileNav({ user }: { user: MobileNavUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Route changes don't remount the header (it lives in the root layout), so the
  // menu has to be closed explicitly once a link navigation actually happens.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-gray-200/80 bg-white/95 shadow-soft backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/95">
          <nav className="flex flex-col gap-1 px-4 py-3 text-sm">
            <Link href="/jobs" className={linkClass}>
              Find jobs
            </Link>
            <Link href="/companies" className={linkClass}>
              Companies
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className={linkClass}>
                  Dashboard
                </Link>
                {user.isJobSeeker ? (
                  <Link href="/applications" className={linkClass}>
                    My applications
                  </Link>
                ) : null}
                {user.hasEmployeeRecords ? (
                  <Link href="/employment" className={linkClass}>
                    My employment
                  </Link>
                ) : null}
                {user.isPlatformAdmin ? (
                  <>
                    <Link href="/admin/settings" className={linkClass}>
                      Admin
                    </Link>
                    <Link href="/admin/verifications" className={linkClass}>
                      Verifications
                    </Link>
                  </>
                ) : null}
                <form action={logoutAction} className="pt-1">
                  <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass}>
                  Sign in
                </Link>
                <Link href="/register" className="pt-1">
                  <Button size="sm" className="w-full">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
