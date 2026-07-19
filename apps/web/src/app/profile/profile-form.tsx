"use client";

import { NIGERIA_STATE_LABELS, NIGERIA_STATES } from "@eaglehr/types";
import { Button, Input, Label, Select, Textarea } from "@eaglehr/ui";
import { useActionState } from "react";
import { ResumeUploadField } from "@/components/resume-upload-field";
import { updateProfileAction } from "@/lib/profile-actions";

interface ProfileFormProps {
  profile: {
    headline: string | null;
    summary: string | null;
    resumeUrl: string | null;
    yearsOfExperience: number | null;
    currentState: string | null;
    currentCity: string | null;
    skills: string[];
  } | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" name="headline" defaultValue={profile?.headline ?? ""} placeholder="Backend Developer" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" defaultValue={profile?.summary ?? ""} rows={4} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Resume / CV</Label>
        <ResumeUploadField currentResumeUrl={profile?.resumeUrl ?? null} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="yearsOfExperience">Years of experience</Label>
          <Input
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min={0}
            defaultValue={profile?.yearsOfExperience ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentCity">City</Label>
          <Input id="currentCity" name="currentCity" defaultValue={profile?.currentCity ?? ""} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentState">State</Label>
        <Select id="currentState" name="currentState" defaultValue={profile?.currentState ?? ""}>
          <option value="" disabled>
            Select...
          </option>
          {NIGERIA_STATES.map((state) => (
            <option key={state} value={state}>
              {NIGERIA_STATE_LABELS[state]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={profile?.skills?.join(", ") ?? ""}
          placeholder="Node.js, PostgreSQL, React"
        />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
