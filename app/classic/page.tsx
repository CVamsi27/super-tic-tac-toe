"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ClassicTicTacToe } from "@/components/Game/ClassicTicTacToe";
import { Loading } from "@/components/ui/loading";

type DifficultyLevel = "easy" | "medium" | "hard";

function ClassicGameContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") as "local" | "ai" || "local";
  const difficulty = (searchParams.get("difficulty") as DifficultyLevel) || "medium";

  return (
    <ClassicTicTacToe
      mode={mode}
      aiDifficulty={difficulty}
    />
  );
}

export default function ClassicPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-gradient-main">
        <Loading size="lg" />
      </div>
    }>
      <ClassicGameContent />
    </Suspense>
  );
}
