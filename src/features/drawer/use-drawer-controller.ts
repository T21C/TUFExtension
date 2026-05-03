import { useMemo } from "react";
import type { ResolvedTufContext } from "~/domain/tuf/types";
import type { SupportedLanguage } from "~/platform/chrome/i18n";

interface UseDrawerControllerParams {
  activeItemKey: string | null;
  emptyReason: string | null;
  isOpen: boolean;
  isPinned: boolean;
  isResolving: boolean;
  isSpoilerProtectionDisabled: boolean;
  language: SupportedLanguage;
  items: ResolvedTufContext[];
  onClose: () => void;
  onSelectItem: (itemKey: string) => void;
  onToggleLanguage: () => void;
  onTogglePinned: () => void;
  onToggleSpoilerProtection: () => void;
}

export function useDrawerController({
  activeItemKey,
  emptyReason,
  isOpen,
  isPinned,
  isResolving,
  isSpoilerProtectionDisabled,
  language,
  items,
  onClose,
  onSelectItem,
  onToggleLanguage,
  onTogglePinned,
  onToggleSpoilerProtection,
}: UseDrawerControllerParams): UseDrawerControllerParams {
  const safeActiveItemKey = useMemo(() => {
    if (items.length === 0) {
      return null;
    }

    if (items.some((item) => item.itemKey === activeItemKey)) {
      return activeItemKey;
    }

    return items[0].itemKey;
  }, [activeItemKey, items]);

  return {
    activeItemKey: safeActiveItemKey,
    emptyReason,
    isOpen,
    isPinned,
    isResolving,
    isSpoilerProtectionDisabled,
    language,
    items,
    onClose,
    onSelectItem,
    onToggleLanguage,
    onTogglePinned,
    onToggleSpoilerProtection,
  };
}
