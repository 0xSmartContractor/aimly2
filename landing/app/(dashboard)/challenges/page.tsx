import { Suspense } from "react";
import { ChallengeList } from "@/components/challenges/challenge-list";
import { CreateChallengeButton } from "@/components/challenges/create-challenge-button";

export default function ChallengesPage() {
  return (
    <div className="flex flex-col space-y-6 p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <CreateChallengeButton />
      </div>

      <Suspense fallback={<div>Loading challenges...</div>}>
        <ChallengeList />
      </Suspense>
    </div>
  );
}