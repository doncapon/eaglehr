import { proxyVerificationDownload } from "@/lib/verification-download";

interface RouteParams {
  params: Promise<{ organizationId: string; type: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { organizationId, type } = await params;
  return proxyVerificationDownload(`/admin/verifications/organizations/${organizationId}/documents/${type}`);
}
