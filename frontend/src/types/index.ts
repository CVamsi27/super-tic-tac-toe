import { z } from "zod";

export const PlayerSymbol = z.enum(["X", "O", "T"]).nullable();
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
  REMOTE = "remote",
  AI = "ai",
}

export const GameSchema = z.object({
  game_id: z.string(),
  mode: z.nativeEnum(GameModeType),
});

export interface GameState {
  id: string;
  players: Player[];
  globalBoard: GameBoardType;
  currentPlayer: PlayerType | null;
  activeBoard: number | null;
  watchers: number;
  winner: PlayerType | null;
  moveCount: number;
  mode: GameModeType;
}

export interface GameStore {
  games: Record<string, GameState>;
  initializeGame: (gameId: string) => void;
  addPlayer: (
    gameId: string,
    playerDetails: Player,
    watchers: number,
    globalBoard: GameBoardType,
    activeBoard: number,
    moveCount: number,
    winner: PlayerType,
    currentPlayer: PlayerType,
  ) => void;
  updateWatcher: (gameId: string, watchers: number) => void;
  updateGame: (
    gameId: string,
    globalBoard: GameBoardType,
    activeBoard: number,
    moveCount: number,
    winner: PlayerType,
    currentPlayer: PlayerType,
  ) => void;
}

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
  gameId: z.string(),
  userId: z.string(),
  move: z.object({
    playerId: z.string(),
    global_board_index: z.number(),
    local_board_index: z.number(),
  }),
});

const LeaveWatcherMessageSchema = z.object({
  type: z.literal("leave_watcher"),
  gameId: z.string(),
  userId: z.string(),
});

const ErrorMessageSchema = z.object({
  type: z.literal("error"),
  userId: z.string().optional(),
  message: z.string(),
});

const PlayerJoinedMessageSchema = z.object({
  type: z.literal("player_joined"),
  gameId: z.string(),
  userId: z.string(),
  status: PlayerStatusSchema,
  symbol: PlayerSymbol,
  watchers_count: z.number(),
  game_state: z.object({
    global_board: GameBoardSchema,
    active_board: z.number(),
    move_count: z.number(),
    winner: PlayerSymbol.nullable(),
    current_player: PlayerSymbol.nullable(),
  }),
});

const GameUpdateMessageSchema = z.object({
  type: z.literal("game_update"),
  gameId: z.string(),
  userId: z.string(),
  game_state: z.object({
    global_board: GameBoardSchema,
    active_board: z.number(),
    move_count: z.number(),
    winner: PlayerSymbol.nullable(),
    current_player: PlayerSymbol.nullable(),
  }),
});

const WatchersUpdateMessageSchema = z.object({
  type: z.literal("watchers_update"),
  gameId: z.string(),
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
