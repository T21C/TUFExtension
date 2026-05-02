import { useMemo, useState } from "react";
import { LevelActionStrip } from "./components/level-action-strip";
import {
  LevelDetailError,
  LevelDetailSkeleton,
} from "./components/level-detail-state";
import { LevelHero } from "./components/level-hero";
import { LevelStatsPanel } from "./components/level-stats-panel";
import { LeaderboardPanel } from "./leaderboard/leaderboard-panel";
import { sortPasses } from "./leaderboard/leaderboard-sort";
import type {
  LeaderboardSortKey,
  LevelPageData,
  LevelPageLoadState,
  SortDirection,
} from "~/domain/tuf/types";
import { useLevelLike } from "~/features/drawer/use-level-like";

interface LevelDetailViewProps {
  state: LevelPageLoadState;
  onRetry: () => void;
}

export function LevelDetailView({ onRetry, state }: LevelDetailViewProps) {
  if (state.isLoading && !state.data) {
    return <LevelDetailSkeleton />;
  }

  if (!state.data) {
    return <LevelDetailError message={state.error} onRetry={onRetry} />;
  }

  return <LoadedLevelDetail data={state.data} />;
}

function LoadedLevelDetail({ data }: { data: LevelPageData }) {
  const [sortKey, setSortKey] = useState<LeaderboardSortKey>("SCR");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(true);
  const likeController = useLevelLike({
    initialLikes: data.level.likes,
    levelId: data.level.id,
  });
  const sortedPasses = useMemo(
    () => sortPasses(data.passes, sortKey, sortDirection),
    [data.passes, sortDirection, sortKey],
  );

  function handleSort(nextSortKey: LeaderboardSortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection("desc");
  }

  return (
    <article className="space-y-2.5 pb-4 text-white">
      <LevelHero data={data} likeController={likeController} />
      <LevelActionStrip data={data} likeController={likeController} />
      <LevelStatsPanel data={data} likeController={likeController} />
      <LeaderboardPanel
        isOpen={isLeaderboardOpen}
        onToggle={() => setIsLeaderboardOpen((current) => !current)}
        passes={sortedPasses}
        sortDirection={sortDirection}
        sortKey={sortKey}
        onSort={handleSort}
      />
    </article>
  );
}
