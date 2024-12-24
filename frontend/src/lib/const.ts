import { GameModeType } from "@/types";

export const CHOOSE_GAME_TYPES: Record<keyof typeof GameModeType, string> = {
  LOCAL: "A Friend next to you",
  REMOTE: "A Friend !next to you",
  AI: "AI",
};
