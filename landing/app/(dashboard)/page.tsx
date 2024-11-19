import { Suspense } from "react";
import { UserProfile } from "@/components/dashboard/user-profile";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTournaments } from "@/components/dashboard/upcoming-tournaments";
import { ActiveChallenges } from "@/components/dashboard/active-challenges";

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6 p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Loading profile...</div>}>
          <UserProfile />
        </Suspense>

        <Suspense fallback={<div>Loading activity...</div>}>
          <RecentActivity />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Loading tournaments...</div>}>
          <UpcomingTournaments />
        </Suspense>

        <Suspense fallback={<div>Loading challenges...</div>}>
          <ActiveChallenges />
        </Suspense>
      </div>
    </div>
  );
}