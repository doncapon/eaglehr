import { ORG_ROLES, type OrgRole } from "@eaglehr/types";
import { Button, Select } from "@eaglehr/ui";
import { apiFetch } from "@/lib/api";
import { removeMemberAction, updateMemberRoleAction } from "@/lib/organization-actions";
import { InviteMemberForm } from "./invite-member-form";

interface Member {
  id: string;
  role: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

interface TeamPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { organizationId } = await params;
  const members = await apiFetch<Member[]>(`/organizations/${organizationId}/members`);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage who has access to this organization.</p>
      </div>

      <div className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {members.map((member) => (
          <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">
                {member.user.firstName} {member.user.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateMemberRoleAction(organizationId, member.id, formData.get("role") as OrgRole);
                }}
                className="flex items-center gap-2"
              >
                <Select name="role" defaultValue={member.role} className="w-36">
                  {ORG_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
                <Button type="submit" size="sm" variant="outline">
                  Update
                </Button>
              </form>
              <form action={removeMemberAction.bind(null, organizationId, member.id)}>
                <Button type="submit" size="sm" variant="destructive">
                  Remove
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <InviteMemberForm organizationId={organizationId} />
    </div>
  );
}
