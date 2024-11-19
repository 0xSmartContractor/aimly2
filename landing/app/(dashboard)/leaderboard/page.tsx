import { Suspense } from "react";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col space-y-6 p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <LeaderboardFilters />

      <Suspense fallback={<div>Loading leaderboard...</div>}>
        <LeaderboardTable />
      </Suspense>
    </div>
  );
}