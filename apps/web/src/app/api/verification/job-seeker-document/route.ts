import { proxyVerificationDownload } from "@/lib/verification-download";

export async function GET() {
  return proxyVerificationDownload("/me/profile/verification/document");
}
