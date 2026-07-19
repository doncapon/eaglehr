import { FadeInUp } from "@/components/animated";
import { apiFetch } from "@/lib/api";
import { ProfileForm } from "./profile-form";

interface Profile {
  headline: string | null;
  summary: string | null;
  resumeUrl: string | null;
  yearsOfExperience: number | null;
  currentState: string | null;
  currentCity: string | null;
  skills: string[];
}

export default async function ProfilePage() {
  const profile = await apiFetch<Profile | null>("/me/profile");

  return (
    <div className="flex flex-col gap-6">
      <FadeInUp>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">This is what employers see when you apply.</p>
      </FadeInUp>
      <FadeInUp delay={0.08}>
        <ProfileForm profile={profile} />
      </FadeInUp>
    </div>
  );
}
