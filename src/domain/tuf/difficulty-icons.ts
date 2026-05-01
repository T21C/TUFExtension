import { asRecord, readNumber, readString } from "@shared/object";
import type { TufRecord } from "./types";

export interface DifficultyEntry {
  baseScore?: number;
  icon?: string;
  id: string;
  name?: string;
  type?: string;
}

export function createDifficultyCatalog(payload: unknown): Map<string, DifficultyEntry> {
  const difficulties = Array.isArray(payload)
    ? payload.map(asRecord).filter(isTufRecord)
    : [];
  const catalog = new Map<string, DifficultyEntry>();

  for (const difficulty of difficulties) {
    const id = readString(difficulty, ["id"]);
    if (!id) {
      continue;
    }

    catalog.set(id, {
      baseScore: readNumber(difficulty, ["baseScore"]),
      icon: selectIconSize(readString(difficulty, ["icon"]), "medium"),
      id,
      name: readString(difficulty, ["name"]),
      type: readString(difficulty, ["type"])
    });
  }

  return catalog;
}

export function needsDifficultyCatalog(candidate: TufRecord): boolean {
  return Boolean(!getDirectDifficulty(candidate)?.icon && readString(candidate, ["diffId"]));
}

export function getTabIcon(
  candidate: TufRecord,
  difficultyCatalog?: Map<string, DifficultyEntry>
): { alt: string; url: string } | undefined {
  const directDifficulty = getDirectDifficulty(candidate);
  if (directDifficulty?.icon) {
    return {
      alt: `${directDifficulty.name ?? "Difficulty"} icon`,
      url: directDifficulty.icon
    };
  }

  const diffId = readString(candidate, ["diffId"]);
  const catalogDifficulty = diffId ? difficultyCatalog?.get(diffId) : undefined;

  if (catalogDifficulty?.icon) {
    return {
      alt: `${catalogDifficulty.name ?? "Difficulty"} icon`,
      url: catalogDifficulty.icon
    };
  }

  return undefined;
}

export function getDirectDifficulty(candidate: TufRecord): DifficultyEntry | undefined {
  const difficulty = asRecord(candidate.difficulty);
  if (!difficulty) {
    return undefined;
  }

  const id = readString(difficulty, ["id"]);
  const icon = selectIconSize(readString(difficulty, ["icon"]), "medium");

  if (!id && !icon) {
    return undefined;
  }

  return {
    icon,
    id: id ?? "",
    name: readString(difficulty, ["name"]),
    type: readString(difficulty, ["type"])
  };
}

function selectIconSize(url: string | undefined, size: "medium" | "small"): string | undefined {
  return url?.replace("/original", `/${size}`);
}

function isTufRecord(value: TufRecord | null): value is TufRecord {
  return Boolean(value);
}
