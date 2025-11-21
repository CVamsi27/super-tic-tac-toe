import { GameModeType } from "@/types";

export const CHOOSE_GAME_TYPES: Record<keyof typeof GameModeType, string> = {
  REMOTE: "Invite & Play (Share Link)",
  RANDOM: "Quick Match (Random Opponent)",
  AI: "Play vs AI",
};

export const LEAVE_TIMEOUT = 10000;
