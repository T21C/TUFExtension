import {
  CalendarIcon,
  PercentIcon,
  ScoreIcon,
  SpeedIcon,
} from "@drawer/shared/level-icons";
import type {
  LeaderboardSortKey,
  LevelPass,
  SortDirection,
} from "@domain/tuf/types";
import {
  formatAccuracy,
  formatDate,
  formatScore,
  formatSpeed,
} from "@drawer/shared/formatters";

export const SORT_OPTIONS: Array<{
  icon: typeof CalendarIcon;
  key: LeaderboardSortKey;
  label: string;
}> = [
  { icon: CalendarIcon, key: "TIME", label: "Clear date" },
  { icon: PercentIcon, key: "ACC", label: "Accuracy" },
  { icon: SpeedIcon, key: "SPEED", label: "Speed" },
  { icon: ScoreIcon, key: "SCR", label: "Score" },
];

export function sortPasses(
  passes: LevelPass[],
  sortKey: LeaderboardSortKey,
  sortDirection: SortDirection,
): LevelPass[] {
  const direction = sortDirection === "desc" ? 1 : -1;

  return [...passes].sort((a, b) => {
    let result = 0;

    if (sortKey === "TIME") {
      result = getTimeValue(a) - getTimeValue(b);
    } else if (sortKey === "ACC") {
      result = b.accuracy - a.accuracy;
    } else if (sortKey === "SPEED") {
      result = b.speed - a.speed;
    } else {
      result = b.score - a.score;
    }

    if (result !== 0) {
      return result * direction;
    }

    if (a.score !== b.score) {
      return b.score - a.score;
    }

    return a.playerName.localeCompare(b.playerName);
  });
}

export function getPassMetric(
  pass: LevelPass,
  sortKey: LeaderboardSortKey,
): { label: string; value: string } {
  if (sortKey === "TIME") {
    return {
      label: "Date",
      value: pass.date ? formatDate(pass.date).slice(5) : "-",
    };
  }

  if (sortKey === "ACC") {
    return {
      label: "Acc",
      value: formatAccuracy(pass.accuracy),
    };
  }

  if (sortKey === "SPEED") {
    return {
      label: "Speed",
      value: formatSpeed(pass.speed),
    };
  }

  return {
    label: "Score",
    value: formatScore(pass.score),
  };
}

export function getTimeValue(pass: LevelPass): number {
  if (!pass.date) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = Date.parse(pass.date);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}
