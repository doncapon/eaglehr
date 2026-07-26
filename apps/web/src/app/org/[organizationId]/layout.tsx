import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

interface OrgLayoutProps {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { organizationId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let organization: { id: string; name: string };
  try {
    organization = await apiFetch<{ id: string; name: string }>(`/organizations/${organizationId}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      notFound();
    }
    throw err;
  }

  const navItems = [
    { href: `/org/${organizationId}/dashboard`, label: "Dashboard" },
    { href: `/org/${organizationId}/jobs`, label: "Jobs" },
    { href: `/org/${organizationId}/employees`, label: "Employees" },
    { href: `/org/${organizationId}/team`, label: "Team" },
    { href: `/org/${organizationId}/billing`, label: "Billing" },
    { href: `/org/${organizationId}/settings`, label: "Settings" },
  ];

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <aside className="flex shrink-0 flex-col gap-1 sm:w-48">
        <h2 className="mb-2 truncate text-sm font-semibold text-gray-500 dark:text-gray-400">{organization.name}</h2>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
