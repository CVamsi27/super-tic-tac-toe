"use client";

import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { GameStore } from "@/types";

export function useHydratedStore<T>(selector: (state: GameStore) => T): T {
  const [hydrated, setHydrated] = useState(false);

  const store = useGameStore(selector);

  const snapShot = useMemo(() => selector(useGameStore.getState()), [selector]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated ? store : snapShot;
}
