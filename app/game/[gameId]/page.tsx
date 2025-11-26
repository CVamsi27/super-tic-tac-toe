"use client";

import SuperTicTacToe from "@/components/Game/SuperTicTacToe";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { GameLoading } from "@/components/GameLoading";
import { useAuth } from "@/context/AuthContext";

export default function Game() {
  const [userId, setUserId] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      localStorage.setItem("user_id", user.id);
    } else if (!authLoading) {
      const storedUserId = localStorage.getItem("user_id") || nanoid();
      if (!localStorage.getItem("user_id")) {
        localStorage.setItem("user_id", storedUserId);
      }
      setUserId(storedUserId);
    }
  }, [user, authLoading]);

  if (!userId || authLoading) return <GameLoading />;

  return <SuperTicTacToe userId={userId} />;
}
