import { useMemo } from "react";
import type { ResolvedTufContext } from "@domain/tuf/types";

interface UseDrawerControllerParams {
  activeItemKey: string;
  isOpen: boolean;
  items: ResolvedTufContext[];
  onClose: () => void;
  onSelectItem: (itemKey: string) => void;
}

export function useDrawerController({
  activeItemKey,
  isOpen,
  items,
  onClose,
  onSelectItem
}: UseDrawerControllerParams): UseDrawerControllerParams {
  const safeActiveItemKey = useMemo(() => {
    if (items.some((item) => item.itemKey === activeItemKey)) {
      return activeItemKey;
    }

    return items[0]?.itemKey ?? activeItemKey;
  }, [activeItemKey, items]);

  return {
    activeItemKey: safeActiveItemKey,
    isOpen,
    items,
    onClose,
    onSelectItem
  };
}
