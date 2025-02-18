import { GameModeType } from "@/types";

export const CHOOSE_GAME_TYPES: Record<keyof typeof GameModeType, string> = {
  REMOTE: "Play with a friend",
  AI: "AI",
};

export const LEAVE_TIMEOUT = 10000;
