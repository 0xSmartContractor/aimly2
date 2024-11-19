import { Suspense } from "react";
import { TournamentList } from "@/components/tournaments/tournament-list";
import { TournamentFilters } from "@/components/tournaments/tournament-filters";
import { CreateTournamentButton } from "@/components/tournaments/create-tournament-button";

export default function TournamentsPage() {
  return (
    <div className="flex flex-col space-y-6 p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <CreateTournamentButton />
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <TournamentFilters />
        <Suspense fallback={<div>Loading tournaments...</div>}>
          <TournamentList />
        </Suspense>
      </div>
    </div>
  );
}