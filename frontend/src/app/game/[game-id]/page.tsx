import SuperTicTacToe from "@/components/Game/SuperTicTacToe";
import { GameModeType } from "@/types";

export default function NextToYou() {
  return <SuperTicTacToe gameMode={GameModeType.LOCAL} />;
}
