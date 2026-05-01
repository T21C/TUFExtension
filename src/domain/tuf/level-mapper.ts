import { asRecord, readString } from "@shared/object";
import { getTabIcon, type DifficultyEntry } from "./difficulty-icons";
import type { VideoReference } from "@domain/video/types";
import type { ResolvedLevelContext, TufRecord } from "./types";

export function mapLevel(
  video: VideoReference,
  candidate: TufRecord,
  difficultyCatalog?: Map<string, DifficultyEntry>
): ResolvedLevelContext {
  const levelId =
    readString(candidate, ["id", "levelId", "_id", "uuid"]) ?? video.externalId;
  const title =
    readString(candidate, ["song", "title", "name", "levelName"]) ?? "TUF Level";
  const tabIcon = getTabIcon(candidate, difficultyCatalog);

  return {
    video,
    levelId,
    tabIconAlt: tabIcon?.alt,
    tabIconUrl: tabIcon?.url,
    title,
    url: `https://tuforums.com/levels/${levelId}`,
    raw: candidate
  };
}

export function getLevelCandidates(payload: unknown): TufRecord[] {
  if (Array.isArray(payload)) {
    return payload.map(asRecord).filter(isTufRecord);
  }

  const record = asRecord(payload);
  if (!record) {
    return [];
  }

  for (const key of ["items", "data", "results", "levels"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.map(asRecord).filter(isTufRecord);
    }
  }

  return [];
}

export function dedupeLevels(levels: ResolvedLevelContext[]): ResolvedLevelContext[] {
  const seen = new Set<string>();
  return levels.filter((level) => {
    if (seen.has(level.levelId)) {
      return false;
    }

    seen.add(level.levelId);
    return true;
  });
}

export function describePayload(payload: unknown): string {
  if (Array.isArray(payload)) {
    return `array(${payload.length})`;
  }

  if (payload && typeof payload === "object") {
    return `object(${Object.keys(payload).join(", ")})`;
  }

  return typeof payload;
}

function isTufRecord(value: TufRecord | null): value is TufRecord {
  return Boolean(value);
}
