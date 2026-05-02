import { useEffect, useMemo, useState } from "react";
import {
  sendRuntimeMessage,
  type GetLevelPageDataResult,
} from "~/platform/chrome/runtime-message";
import type {
  LevelPageLoadState,
  ResolvedLevelContext,
} from "~/domain/tuf/types";

interface UseLevelPageParams {
  activeLevelId: string;
  levels: ResolvedLevelContext[];
}

export function useLevelPage({ activeLevelId, levels }: UseLevelPageParams): {
  activeLevel: ResolvedLevelContext;
  activeState: LevelPageLoadState;
  retryActiveLevel: () => void;
} {
  const [loadStates, setLoadStates] = useState<
    Record<string, LevelPageLoadState>
  >({});
  const [retryNonce, setRetryNonce] = useState(0);
  const activeLevel = useMemo(
    () => levels.find((level) => level.levelId === activeLevelId) ?? levels[0],
    [activeLevelId, levels],
  );
  const activeState = loadStates[activeLevel.levelId] ?? { isLoading: true };

  useEffect(() => {
    const knownLevelIds = new Set(levels.map((level) => level.levelId));
    setLoadStates((current) => {
      const next: Record<string, LevelPageLoadState> = {};

      for (const [levelId, state] of Object.entries(current)) {
        if (knownLevelIds.has(levelId)) {
          next[levelId] = state;
        }
      }

      return next;
    });
  }, [levels]);

  useEffect(() => {
    const levelId = activeLevel.levelId;
    const current = loadStates[levelId];

    if (current?.data && retryNonce === 0) {
      return;
    }

    let isCancelled = false;

    setLoadStates((states) => ({
      ...states,
      [levelId]: {
        data: states[levelId]?.data,
        error: undefined,
        isLoading: true,
      },
    }));

    void sendRuntimeMessage<GetLevelPageDataResult>({
      levelId,
      type: "GET_LEVEL_PAGE_DATA",
    }).then((response) => {
      if (isCancelled) {
        return;
      }

      if (!response?.data) {
        setLoadStates((states) => ({
          ...states,
          [levelId]: {
            error: response?.error ?? "Failed to load level data.",
            isLoading: false,
          },
        }));
        return;
      }

      setLoadStates((states) => ({
        ...states,
        [levelId]: {
          data: response.data,
          isLoading: false,
        },
      }));
    });

    return () => {
      isCancelled = true;
    };
  }, [activeLevel.levelId, retryNonce]);

  return {
    activeLevel,
    activeState,
    retryActiveLevel: () => setRetryNonce((value) => value + 1),
  };
}
