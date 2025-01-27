"use client";

import SuperTicTacToe from "@/components/Game/SuperTicTacToe";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Loading } from "@/components/ui/loading";

export default function Game() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id") || nanoid();
    if (!localStorage.getItem("user_id")) {
      localStorage.setItem("user_id", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  if (!userId) return <Loading />;

  return <SuperTicTacToe userId={userId} />;
}
