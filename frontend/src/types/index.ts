import { z } from "zod";

export const PlayerSchema = z.enum(["X", "O"]);
export type PlayerType = z.infer<typeof PlayerSchema>;

export const BoardCellSchema = PlayerSchema.nullable();
export type BoardCellType = z.infer<typeof BoardCellSchema>;

export const SmallBoardSchema = z.array(BoardCellSchema);
export type SmallBoardType = z.infer<typeof SmallBoardSchema>;

export const GameBoardSchema = z.array(SmallBoardSchema);
export type GameBoardType = z.infer<typeof GameBoardSchema>;
