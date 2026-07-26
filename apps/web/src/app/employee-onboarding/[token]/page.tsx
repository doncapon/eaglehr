import { ApiError, publicApiFetch } from "@/lib/api";
import { CompleteOnboardingForm } from "./complete-onboarding-form";

interface OnboardingInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  organizationName: string;
}

interface EmployeeOnboardingPageProps {
  params: Promise<{ token: string }>;
}

export default async function EmployeeOnboardingPage({ params }: EmployeeOnboardingPageProps) {
  const { token } = await params;

  let info: OnboardingInfo;
  try {
    info = await publicApiFetch<OnboardingInfo>(`/employee-onboarding/${token}`);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "This onboarding link is invalid.";
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-3 py-16 text-center">
        <h1 className="text-2xl font-bold">This link isn&apos;t valid</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ask your HR team to send you a new invite.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome to {info.organizationName}, {info.firstName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You&apos;ve been added as {info.jobTitle}. Complete your profile below to set up your EagleHire account.
        </p>
      </div>

      <CompleteOnboardingForm token={token} />
    </div>
  );
}
