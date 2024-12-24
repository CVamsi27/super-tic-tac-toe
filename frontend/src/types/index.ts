import { z } from "zod";

export const PlayerSchema = z.enum(["X", "O"]);
export type PlayerType = z.infer<typeof PlayerSchema>;

export const BoardCellSchema = PlayerSchema.nullable();
export type BoardCellType = z.infer<typeof BoardCellSchema>;

export const SmallBoardSchema = z.array(BoardCellSchema);
export type SmallBoardType = z.infer<typeof SmallBoardSchema>;

export const GameBoardSchema = z.array(SmallBoardSchema);
export type GameBoardType = z.infer<typeof GameBoardSchema>;

export enum GameModeType {
  LOCAL = "local",
  REMOTE = "remote",
  AI = "ai",
}

export const GameSchema = z.object({
  game_id: z.string(),
  mode: z.nativeEnum(GameModeType),
});

export type GameData = z.infer<typeof GameSchema>;
