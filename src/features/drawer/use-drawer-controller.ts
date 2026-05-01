import { useMemo } from "react";
import type { ResolvedLevelContext } from "@domain/tuf/types";

interface UseDrawerControllerParams {
  activeLevelId: string;
  isOpen: boolean;
  levels: ResolvedLevelContext[];
  onClose: () => void;
  onSelectLevel: (levelId: string) => void;
}

export function useDrawerController({
  activeLevelId,
  isOpen,
  levels,
  onClose,
  onSelectLevel
}: UseDrawerControllerParams): UseDrawerControllerParams {
  const safeActiveLevelId = useMemo(() => {
    if (levels.some((level) => level.levelId === activeLevelId)) {
      return activeLevelId;
    }

    return levels[0]?.levelId ?? activeLevelId;
  }, [activeLevelId, levels]);

  return {
    activeLevelId: safeActiveLevelId,
    isOpen,
    levels,
    onClose,
    onSelectLevel
  };
}
