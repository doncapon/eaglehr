import { proxyVerificationDownload } from "@/lib/verification-download";

interface RouteParams {
  params: Promise<{ organizationId: string; employeeId: string; documentId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { organizationId, employeeId, documentId } = await params;
  return proxyVerificationDownload(
    `/organizations/${organizationId}/employees/${employeeId}/documents/${documentId}/download`,
  );
}
