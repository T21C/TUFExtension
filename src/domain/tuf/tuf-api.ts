import axios from "axios";
import { asRecord, readNumber, readString, type UnknownRecord } from "@shared/object";
import { logDebug, logError, logInfo, logWarn } from "@shared/logger";
import {
  createDifficultyCatalog,
  needsDifficultyCatalog,
  type DifficultyEntry
} from "./difficulty-icons";
import {
  dedupeLevels,
  describePayload,
  getLevelCandidates,
  mapLevel
} from "./level-mapper";
import type { VideoReference } from "@domain/video/types";
import type {
  AuthUser,
  LevelAuthState,
  LevelCuration,
  LevelCurationType,
  LevelDetail,
  LevelDifficulty,
  LevelPageData,
  LevelPass,
  LevelPassJudgements,
  LevelStats,
  LevelTag,
  ResolvedLevelContext,
  TufRecord
} from "./types";

const TUF_API_BASE_URL = "https://api.tuforums.com";

let difficultyCatalogPromise: Promise<Map<string, DifficultyEntry>> | null = null;

const tufApi = axios.create({
  baseURL: TUF_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0"
  }
});

export async function resolveLevelByVideoUrl(
  video: VideoReference
): Promise<ResolvedLevelContext[]> {
  const query = `videoLink:${video.externalId}`;

  try {
    logInfo("Calling TUF level lookup API", {
      path: "/v2/database/levels",
      query
    });

    const lookupResponse = await tufApi.get<unknown>("/v2/database/levels", {
      params: { query }
    });

    logDebug("Received TUF level lookup response", {
      status: lookupResponse.status,
      payloadShape: describePayload(lookupResponse.data)
    });

    const candidates = getLevelCandidates(lookupResponse.data);

    if (candidates.length === 0) {
      logInfo("TUF level lookup returned no candidates");
      return [];
    }

    const difficultyCatalog = candidates.some(needsDifficultyCatalog)
      ? await getDifficultyCatalog()
      : undefined;

    const levels = dedupeLevels(
      candidates.map((candidate) =>
        mapLevel(video, candidate, difficultyCatalog)
      )
    );

    logInfo("Mapped TUF level contexts", {
      count: levels.length,
      levelIds: levels.map((level) => level.levelId)
    });

    return levels;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      logWarn("TUF level lookup Axios error", {
        status,
        message: error.message,
        responseData: error.response?.data
      });

      if (status === 401 || status === 404) {
        return [];
      }

      throw new Error(`TUF API lookup failed with ${status ?? "unknown status"}`, {
        cause: error
      });
    }

    logError("TUF level lookup failed with non-Axios error", error);
    throw error;
  }
}

export async function getLevelPageData(levelId: string): Promise<LevelPageData> {
  logInfo("Calling TUF level page APIs", { levelId });

  try {
    const [detailResponse, cdnResponse, passesResponse, ratingsResponse] =
      await Promise.all([
        tufApi.get<unknown>(`/v2/database/levels/${levelId}`),
        getOptionalApiData(`/v2/database/levels/${levelId}/cdnData`),
        getOptionalApiData(`/v2/database/passes/level/${levelId}`),
        getOptionalApiData(`/v2/database/levels/${levelId}/ratings`)
      ]);

    const detailRecord = asRecord(detailResponse.data);
    const rawLevel = asRecord(detailRecord?.level) ?? detailRecord;

    if (!rawLevel) {
      throw new Error("TUF level detail response did not include a level object");
    }

    const cdnRecord = asRecord(cdnResponse);
    const difficultyCatalog = await getDifficultyCatalog();
    const passes = mapPasses(passesResponse);
    const level = mapLevelDetail(rawLevel, levelId, difficultyCatalog);
    const difficulty = level.difficulty ?? {};
    const videoDetails = await getVideoDetails(level.videoLink);
    const thumbnailUrl = videoDetails?.image ?? getYoutubeThumbnailUrl(level.videoLink);
    const embedUrl = videoDetails?.embed ?? getYoutubeEmbedUrl(level.videoLink);
    const curation = mapCuration(rawLevel);
    const stats = getLevelStats(passes);

    const data: LevelPageData = {
      curation,
      difficulty,
      embedUrl,
      level,
      levelUrl: `https://tuforums.com/levels/${level.id}`,
      metadata: asRecord(cdnRecord?.metadata),
      passes,
      ratings: asRecord(ratingsResponse),
      rerateHistory: Array.isArray(detailRecord?.rerateHistory)
        ? detailRecord.rerateHistory
        : [],
      stats,
      thumbnailUrl,
      transformOptions: asRecord(cdnRecord?.transformOptions)
    };

    logInfo("Mapped TUF level page data", {
      levelId: data.level.id,
      passCount: data.passes.length,
      title: data.level.song
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logWarn("TUF level page API Axios error", {
        levelId,
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status
      });
      throw new Error(
        `TUF level page API failed with ${error.response?.status ?? "unknown status"}`,
        { cause: error }
      );
    }

    logError("TUF level page API failed with non-Axios error", error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await requestCurrentUser();
  } catch (error) {
    if (!isAxiosStatus(error, 401)) {
      logWarn("Failed to load current TUF user", {
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  try {
    await tufApi.post("/v2/auth/refresh");
    return await requestCurrentUser();
  } catch (error) {
    if (isAxiosStatus(error, 401)) {
      logInfo("No authenticated TUF session found");
      return null;
    }

    logWarn("Failed to refresh TUF auth session", {
      message: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

export async function getLevelAuthState(levelId: string): Promise<LevelAuthState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        authStatus: "unauthenticated",
        liked: false
      };
    }

    const likedStatus = await getLevelLikedStatus(levelId);

    return {
      authStatus: "authenticated",
      liked: likedStatus.liked,
      likes: likedStatus.likes,
      user
    };
  } catch (error) {
    return {
      authStatus: "error",
      error: error instanceof Error ? error.message : String(error),
      liked: false
    };
  }
}

export async function getLevelLikedStatus(
  levelId: string
): Promise<{ liked: boolean; likes?: number }> {
  try {
    const response = await tufApi.get<unknown>(
      `/v2/database/levels/${levelId}/isLiked`
    );
    const payload = asRecord(response.data);

    return {
      liked: Boolean(payload?.isLiked),
      likes: readNumber(payload, ["likes"])
    };
  } catch (error) {
    if (isAxiosStatus(error, 401)) {
      return {
        liked: false
      };
    }

    throw error;
  }
}

export async function setLevelLiked(
  levelId: string,
  liked: boolean
): Promise<{ liked: boolean; likes?: number }> {
  const response = await tufApi.put<unknown>(
    `/v2/database/levels/${levelId}/like`,
    {
      action: liked ? "like" : "unlike"
    }
  );
  const payload = asRecord(response.data);

  return {
    liked,
    likes: readNumber(payload, ["likes"])
  };
}

async function getDifficultyCatalog(): Promise<Map<string, DifficultyEntry>> {
  if (!difficultyCatalogPromise) {
    difficultyCatalogPromise = tufApi
      .get<unknown>("/v2/database/difficulties")
      .then((response) => {
        const catalog = createDifficultyCatalog(response.data);
        logDebug("Loaded TUF difficulty catalog for tab icons", {
          count: catalog.size
        });

        return catalog;
      })
      .catch((error) => {
        difficultyCatalogPromise = null;
        logWarn("Failed to load TUF difficulty catalog for tab icons", {
          message: error instanceof Error ? error.message : String(error)
        });
        return new Map<string, DifficultyEntry>();
      });
  }

  return difficultyCatalogPromise;
}

async function requestCurrentUser(): Promise<AuthUser | null> {
  const response = await tufApi.get<unknown>("/v2/auth/profile/me");
  const payload = asRecord(response.data);
  const user = asRecord(payload?.user) ?? payload;

  if (!user) {
    return null;
  }

  const id = readString(user, ["id", "_id", "userId"]);

  if (!id) {
    return null;
  }

  return {
    avatarUrl:
      readString(user, ["avatarUrl", "avatar", "pfp"]) ??
      selectIconSize(readString(user, ["icon"]), "small"),
    id,
    name: readString(user, ["name", "username", "displayName"]),
    raw: user
  };
}

function isAxiosStatus(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}

async function getOptionalApiData(path: string): Promise<unknown> {
  try {
    const response = await tufApi.get<unknown>(path);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status ?? 0)) {
      logWarn("Optional TUF API request returned an ignorable status", {
        path,
        status: error.response?.status
      });
      return null;
    }

    throw error;
  }
}

async function getVideoDetails(
  videoLink: string | undefined
): Promise<{ embed?: string; image?: string } | null> {
  if (!videoLink) {
    return null;
  }

  try {
    const response = await tufApi.get<unknown>(
      `/v2/media/video-details/${encodeURIComponent(videoLink)}`
    );
    const record = asRecord(response.data);

    return {
      embed: readString(record, ["embed"]),
      image: readString(record, ["image"])
    };
  } catch (error) {
    logWarn("Failed to load TUF media video details; using local fallback", {
      message: error instanceof Error ? error.message : String(error),
      videoLink
    });
    return null;
  }
}

function mapLevelDetail(
  rawLevel: TufRecord,
  fallbackId: string,
  difficultyCatalog?: Map<string, DifficultyEntry>
): LevelDetail {
  const songObject = asRecord(rawLevel.songObject);
  const artists = Array.isArray(rawLevel.artists)
    ? rawLevel.artists.map(asRecord).filter(isRecord)
    : [];
  const song = getSongDisplayName(rawLevel, songObject);
  const artist = artists.length > 0
    ? artists.map((artistRecord) => readString(artistRecord, ["name"])).filter(Boolean).join(", ")
    : readString(rawLevel, ["artist"]);
  const difficulty =
    mapDifficultyFromCatalog(rawLevel, difficultyCatalog) ??
    mapDifficulty(asRecord(rawLevel.difficulty));
  const tags = mapTags(rawLevel.tags);

  return {
    artist,
    bpm: readNumber(rawLevel, ["bpm"]),
    creator: getCreatorDisplayName(rawLevel),
    difficulty,
    downloadCount: readNumber(rawLevel, ["downloadCount"]),
    downloadLink: readString(rawLevel, ["dlLink", "downloadLink"]),
    id: readString(rawLevel, ["id", "levelId", "_id", "uuid"]) ?? fallbackId,
    levelLengthInMs: readNumber(rawLevel, ["levelLengthInMs", "durationMs"]),
    likes: readNumber(rawLevel, ["likes"]) ?? 0,
    pp: getDisplayBaseScore(rawLevel, difficulty, tags),
    song,
    tags,
    tilecount: readNumber(rawLevel, ["tilecount", "tileCount"]),
    videoLink: readString(rawLevel, ["videoLink"]),
    workshopLink: readString(rawLevel, ["workshopLink"])
  };
}

function mapDifficulty(rawDifficulty: UnknownRecord | null): LevelDifficulty | undefined {
  if (!rawDifficulty) {
    return undefined;
  }

  return {
    baseScore: readNumber(rawDifficulty, ["baseScore"]),
    icon: selectIconSize(readString(rawDifficulty, ["icon"]), "medium"),
    id: readString(rawDifficulty, ["id"]),
    name: readString(rawDifficulty, ["name"]),
    type: readString(rawDifficulty, ["type"])
  };
}

function mapDifficultyFromCatalog(
  rawLevel: TufRecord,
  difficultyCatalog: Map<string, DifficultyEntry> | undefined
): LevelDifficulty | undefined {
  const diffId = readString(rawLevel, ["diffId", "difficultyId"]);
  const difficulty = diffId ? difficultyCatalog?.get(diffId) : undefined;

  if (!difficulty) {
    return undefined;
  }

  return {
    baseScore: difficulty.baseScore,
    icon: difficulty.icon,
    id: difficulty.id,
    name: difficulty.name,
    type: difficulty.type
  };
}

function getDisplayBaseScore(
  rawLevel: TufRecord,
  difficulty: LevelDifficulty | undefined,
  tags: LevelTag[]
): number | undefined {
  const editedBaseScore = readNumber(rawLevel, ["baseScore"]);
  const defaultBaseScore = difficulty?.baseScore;

  if (hasBaseScoreEditTag(tags) && typeof editedBaseScore === "number") {
    return editedBaseScore;
  }

  return defaultBaseScore ?? editedBaseScore;
}

function hasBaseScoreEditTag(tags: LevelTag[]): boolean {
  return tags.some((tag) => normalizeTagName(tag.name) === "basescoreedit");
}

function normalizeTagName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapTags(value: unknown): LevelTag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(asRecord).filter(isRecord).map((tag, index) => ({
    color: readString(tag, ["color"]),
    icon: selectIconSize(readString(tag, ["icon"]), "small"),
    id: readString(tag, ["id"]) ?? `tag-${index}`,
    name: readString(tag, ["name"]) ?? "Tag"
  }));
}

function mapCuration(rawLevel: TufRecord): LevelCuration | undefined {
  const curation = asRecord(rawLevel.curation);
  if (!curation) {
    return undefined;
  }

  const types = getCurationTypes(curation);
  if (types.length === 0 && !readString(curation, ["description"])) {
    return undefined;
  }

  return {
    description: readString(curation, ["description"]),
    id: readString(curation, ["id"]) ?? "curation",
    types
  };
}

function getCurationTypes(curation: UnknownRecord): LevelCurationType[] {
  const directTypes = Array.isArray(curation.types)
    ? curation.types.map(asRecord).filter(isRecord)
    : [];
  const singleType = asRecord(curation.type);
  const types = directTypes.length > 0 ? directTypes : singleType ? [singleType] : [];

  return types.map((type, index) => ({
    icon: selectIconSize(readString(type, ["icon"]), "small"),
    id: readString(type, ["id"]) ?? `curation-type-${index}`,
    name: readString(type, ["name"]) ?? "Curation"
  }));
}

function mapPasses(payload: unknown): LevelPass[] {
  const items = Array.isArray(payload) ? payload : [];

  return items
    .map(asRecord)
    .filter(isRecord)
    .map((pass, index) => {
      const player = asRecord(pass.player);
      const user = asRecord(player?.user);
      const judgements = asRecord(pass.judgements);

      return {
        accuracy: readNumber(pass, ["accuracy"]) ?? readNumber(judgements, ["accuracy"]) ?? 0,
        country: readString(player, ["country"]),
        date: readString(pass, ["vidUploadTime", "date", "createdAt"]),
        feelingRating: readString(pass, ["feelingRating"]),
        id: readString(pass, ["id"]) ?? `pass-${index}`,
        judgements: mapJudgements(judgements),
        playerAvatarUrl:
          readString(user, ["avatarUrl"]) ??
          selectIconSize(readString(player, ["pfp"]), "small"),
        playerId: readString(pass, ["playerId"]) ?? readString(player, ["id"]),
        playerName: readString(player, ["name"]) ?? "Unknown Player",
        score: readNumber(pass, ["scoreV2", "score"]) ?? 0,
        speed: readNumber(pass, ["speed"]) ?? 1,
        videoLink: readString(pass, ["videoLink"])
      };
    })
    .sort((a, b) => b.score - a.score);
}

function mapJudgements(judgements: UnknownRecord | null): LevelPassJudgements {
  return {
    earlyDouble: readNumber(judgements, ["earlyDouble"]) ?? 0,
    earlySingle: readNumber(judgements, ["earlySingle"]) ?? 0,
    ePerfect: readNumber(judgements, ["ePerfect"]) ?? 0,
    perfect: readNumber(judgements, ["perfect"]) ?? 0,
    lPerfect: readNumber(judgements, ["lPerfect"]) ?? 0,
    lateSingle: readNumber(judgements, ["lateSingle"]) ?? 0,
    lateDouble: readNumber(judgements, ["lateDouble"]) ?? 0
  };
}

function getLevelStats(passes: LevelPass[]): LevelStats {
  if (passes.length === 0) {
    return {
      totalClears: 0,
      uniqueClears: 0
    };
  }

  const withDates = passes.filter((pass) => Boolean(pass.date));
  const byOldestDate = [...withDates].sort(
    (a, b) => Date.parse(a.date ?? "") - Date.parse(b.date ?? "")
  );

  const uniquePlayers = new Set(
    passes.map((pass) => pass.playerId ?? pass.playerName).filter(Boolean)
  );

  return {
    firstClear: byOldestDate[0] ?? passes[0],
    highestAccuracy: passes.reduce((best, pass) =>
      pass.accuracy > best.accuracy ? pass : best
    ),
    highestScore: passes.reduce((best, pass) => (pass.score > best.score ? pass : best)),
    highestSpeed: passes.reduce((best, pass) => (pass.speed > best.speed ? pass : best)),
    totalClears: passes.length,
    uniqueClears: uniquePlayers.size
  };
}

function getSongDisplayName(rawLevel: TufRecord, songObject: UnknownRecord | null): string {
  const songName =
    readString(songObject, ["name"]) ??
    readString(rawLevel, ["song", "title", "name", "levelName"]) ??
    "TUF Level";
  const suffix = readString(rawLevel, ["suffix"]);

  return suffix && songObject ? `${songName} ${suffix}` : songName;
}

function getCreatorDisplayName(rawLevel: TufRecord): string | undefined {
  const team = readString(rawLevel, ["team"]);
  if (team) {
    return team;
  }

  const credits = Array.isArray(rawLevel.levelCredits)
    ? rawLevel.levelCredits.map(asRecord).filter(isRecord)
    : [];

  if (credits.length === 0) {
    return readString(rawLevel, ["creator"]);
  }

  const charters = credits
    .filter((credit) => readString(credit, ["role"])?.toLowerCase() === "charter")
    .map(getCreditCreatorName)
    .filter(Boolean);
  const vfxers = credits
    .filter((credit) => readString(credit, ["role"])?.toLowerCase() === "vfxer")
    .map(getCreditCreatorName)
    .filter(Boolean);

  if (credits.length >= 3) {
    const parts: string[] = [];
    if (charters.length > 0) {
      parts.push(charters.length === 1 ? charters[0] : `${charters[0]} & ${charters.length - 1} more`);
    }
    if (vfxers.length > 0) {
      parts.push(vfxers.length === 1 ? vfxers[0] : `${vfxers[0]} & ${vfxers.length - 1} more`);
    }
    return parts.join(" | ");
  }

  if (credits.length === 2 && charters.length === 2) {
    return `${charters[0]} & ${charters[1]}`;
  }

  if (credits.length === 2 && charters.length === 1 && vfxers.length === 1) {
    return `${charters[0]} | ${vfxers[0]}`;
  }

  return getCreditCreatorName(credits[0]);
}

function getCreditCreatorName(credit: UnknownRecord): string {
  const creator = asRecord(credit.creator);
  const aliases = Array.isArray(creator?.aliases) ? creator.aliases : [];
  const firstAlias = aliases.find((alias) => typeof alias === "string");
  return firstAlias ?? readString(creator, ["name"]) ?? "No credits";
}

function getYoutubeThumbnailUrl(videoLink: string | undefined): string | undefined {
  const id = getYoutubeVideoId(videoLink);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : undefined;
}

function getYoutubeEmbedUrl(videoLink: string | undefined): string | undefined {
  const id = getYoutubeVideoId(videoLink);
  return id ? `https://www.youtube.com/embed/${id}` : undefined;
}

function getYoutubeVideoId(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0];
    }

    return url.searchParams.get("v") ?? undefined;
  } catch {
    return undefined;
  }
}

function selectIconSize(url: string | undefined, size: "medium" | "small"): string | undefined {
  return url?.replace("/original", `/${size}`);
}

function isRecord(value: UnknownRecord | null): value is UnknownRecord {
  return Boolean(value);
}
