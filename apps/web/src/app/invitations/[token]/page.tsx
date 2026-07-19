import { InvitationAccept } from "./invitation-accept";

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;
  return <InvitationAccept token={token} />;
}
