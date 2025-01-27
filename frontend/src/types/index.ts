import { z } from "zod";

export const PlayerSymbol = z.enum(["X", "O"]).nullable();
export type PlayerType = z.infer<typeof PlayerSymbol>;

export const PlayerStatusSchema = z.enum(["PLAYER", "WATCHER"]);
export type PlayerStatus = z.infer<typeof PlayerStatusSchema>;

export const BoardCellSchema = PlayerSymbol.nullable();
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

export const WebSocketMessageType = z.enum([
  "error",
  "player_joined",
  "game_update",
  "watchers_update",
  "join_game",
  "make_move",
  "leave_watcher",
]);

const JoinGameMessageSchema = z.object({
  type: z.literal("join_game"),
  userId: z.string(),
});

const MakeMoveMessageSchema = z.object({
  type: z.literal("make_move"),
  userId: z.string(),
  move: z.object({
    global_board_index: z.number(),
    local_board_index: z.number(),
    move_count: z.number().optional().default(0),
  }),
});

const LeaveWatcherMessageSchema = z.object({
  type: z.literal("leave_watcher"),
  userId: z.string(),
});

const ErrorMessageSchema = z.object({
  type: z.literal("error"),
  userId: z.string().optional(),
  message: z.string(),
});

const PlayerJoinedMessageSchema = z.object({
  type: z.literal("player_joined"),
  game_id: z.string(),
  userId: z.string(),
  status: PlayerStatusSchema,
  symbol: PlayerSymbol,
  watchers_count: z.number(),
});

const GameUpdateMessageSchema = z.object({
  type: z.literal("game_update"),
  userId: z.string(),
  game_state: z.object({
    global_board: z.array(z.array(z.string().nullable())),
    move_count: z.number(),
    winner: z.string().nullable(),
  }),
});

const WatchersUpdateMessageSchema = z.object({
  type: z.literal("watchers_update"),
  game_id: z.string(),
  watchers_count: z.number(),
});

export const WebSocketMessageSchema = z.discriminatedUnion("type", [
  JoinGameMessageSchema,
  MakeMoveMessageSchema,
  LeaveWatcherMessageSchema,
  ErrorMessageSchema,
  PlayerJoinedMessageSchema,
  GameUpdateMessageSchema,
  WatchersUpdateMessageSchema,
]);

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

export const ResetGameResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type ResetGameResponse = z.infer<typeof ResetGameResponseSchema>;

export const HTTPExceptionSchema = z.object({
  detail: z.string(),
  status_code: z.number().optional(),
});

export interface ErrorWithMessage {
  message: string;
}

export const PlayerSchema = z
  .object({
    id: z.string().uuid(),
    symbol: PlayerSymbol,
    status: PlayerStatusSchema.default("PLAYER"),
  })
  .nullable();

export type Player = z.infer<typeof PlayerSchema>;
