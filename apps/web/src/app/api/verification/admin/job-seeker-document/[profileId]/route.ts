import { proxyVerificationDownload } from "@/lib/verification-download";

interface RouteParams {
  params: Promise<{ profileId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { profileId } = await params;
  return proxyVerificationDownload(`/admin/verifications/job-seekers/${profileId}/document`);
}
