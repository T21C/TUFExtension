import type { VideoReference } from "@domain/video/types";
import type { UnknownRecord } from "@shared/object";

export type TufRecord = UnknownRecord;

export interface ResolvedLevelContext {
  kind: "level";
  video: VideoReference;
  itemKey: string;
  levelId: string;
  title: string;
  tabIconAlt?: string;
  tabIconUrl?: string;
  url?: string;
  raw?: unknown;
}

export interface ResolvedPassContext {
  kind: "pass";
  video: VideoReference;
  itemKey: string;
  passId: string;
  levelId?: string;
  playerName?: string;
  tabIconAlt?: string;
  tabIconUrl?: string;
  title: string;
  url?: string;
  raw?: unknown;
}

export type ResolvedTufContext = ResolvedLevelContext | ResolvedPassContext;

export type LeaderboardSortKey = "TIME" | "ACC" | "SPEED" | "SCR";
export type SortDirection = "asc" | "desc";
export type AuthStatus = "authenticated" | "error" | "unauthenticated";

export interface AuthUser {
  avatarUrl?: string;
  id: string;
  name?: string;
  raw?: unknown;
}

export interface LevelAuthState {
  authStatus: AuthStatus;
  error?: string;
  liked: boolean;
  likes?: number;
  user?: AuthUser;
}

export interface LevelDifficulty {
  baseScore?: number;
  icon?: string;
  id?: string;
  name?: string;
  type?: string;
}

export interface LevelTag {
  color?: string;
  icon?: string;
  id: string;
  name: string;
}

export interface LevelCurationType {
  icon?: string;
  id: string;
  name: string;
}

export interface LevelCuration {
  description?: string;
  id: string;
  types: LevelCurationType[];
}

export interface LevelDetail {
  artist?: string;
  bpm?: number;
  creator?: string;
  difficulty?: LevelDifficulty;
  downloadCount?: number;
  downloadLink?: string;
  id: string;
  levelLengthInMs?: number;
  likes: number;
  pp?: number;
  song: string;
  tags: LevelTag[];
  tilecount?: number;
  videoLink?: string;
  workshopLink?: string;
}

export interface LevelPassJudgements {
  earlyDouble: number;
  earlySingle: number;
  ePerfect: number;
  perfect: number;
  lPerfect: number;
  lateSingle: number;
  lateDouble: number;
}

export interface LevelPass {
  accuracy: number;
  country?: string;
  date?: string;
  feelingRating?: string;
  id: string;
  judgements: LevelPassJudgements;
  playerAvatarUrl?: string;
  playerId?: string;
  playerName: string;
  score: number;
  speed: number;
  videoLink?: string;
}

export interface LevelStats {
  firstClear?: LevelPass;
  highestAccuracy?: LevelPass;
  highestScore?: LevelPass;
  highestSpeed?: LevelPass;
  totalClears: number;
  uniqueClears: number;
}

export interface LevelPageData {
  curation?: LevelCuration;
  difficulty: LevelDifficulty;
  embedUrl?: string;
  level: LevelDetail;
  levelUrl: string;
  metadata?: TufRecord | null;
  passes: LevelPass[];
  ratings?: TufRecord | null;
  rerateHistory: unknown[];
  stats: LevelStats;
  thumbnailUrl?: string;
  transformOptions?: TufRecord | null;
}

export interface LevelPageLoadState {
  data?: LevelPageData;
  error?: string;
  isLoading: boolean;
}

export interface PassJudgements {
  earlyDouble: number;
  earlySingle: number;
  ePerfect: number;
  perfect: number;
  lPerfect: number;
  lateSingle: number;
  lateDouble: number;
}

export interface PassPlayer {
  avatarUrl?: string;
  country?: string;
  discordUsername?: string;
  id?: string;
  name: string;
  profileUrl?: string;
  rankedScoreRank?: number;
}

export interface PassLevelSummary {
  artist?: string;
  baseScore?: number;
  charter?: string;
  difficulty?: LevelDifficulty;
  id?: string;
  song: string;
  team?: string;
  videoLink?: string;
  vfxer?: string;
}

export interface PassScoreInfo {
  currentRankedScore?: number;
  impact?: number;
  previousRankedScore?: number;
}

export interface PassDetail {
  accuracy: number;
  date?: string;
  feelingRating?: string;
  id: string;
  is12K: boolean;
  is16K: boolean;
  isDeleted: boolean;
  isHidden: boolean;
  isNoHoldTap: boolean;
  isWorldsFirst: boolean;
  judgements: PassJudgements;
  level: PassLevelSummary;
  player: PassPlayer;
  score: number;
  scoreInfo?: PassScoreInfo;
  speed: number;
  videoLink?: string;
}

export interface PassPageData {
  pass: PassDetail;
  passUrl: string;
  thumbnailUrl?: string;
}

export interface PassPageLoadState {
  data?: PassPageData;
  error?: string;
  isLoading: boolean;
}
