import { Suspense } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatsDisplay } from "@/components/profile/stats-display";
import { MatchHistory } from "@/components/profile/match-history";

export default function ProfilePage() {
  return (
    <div className="flex flex-col space-y-6 p-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Suspense fallback={<div>Loading profile...</div>}>
          <ProfileForm />
        </Suspense>

        <div className="space-y-6">
          <Suspense fallback={<div>Loading stats...</div>}>
            <StatsDisplay />
          </Suspense>

          <Suspense fallback={<div>Loading history...</div>}>
            <MatchHistory />
          </Suspense>
        </div>
      </div>
    </div>
  );
}