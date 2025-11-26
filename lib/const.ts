import { GameModeType, GameVersion } from "@/types";

export const CHOOSE_GAME_TYPES: Record<keyof typeof GameModeType, string> = {
  REMOTE: "Invite & Play (Share Link)",
  RANDOM: "Quick Match (Random Opponent)",
  AI: "Play vs AI",
  LOCAL: "Local 2 Player",
};

export const GAME_VERSIONS: Record<GameVersion, { label: string; desc: string }> = {
  [GameVersion.CLASSIC]: {
    label: "Classic",
    desc: "Traditional 3×3 grid",
  },
  [GameVersion.SUPER]: {
    label: "Super",
    desc: "9×9 strategic grid",
  },
};

export const LEAVE_TIMEOUT = 10000;
