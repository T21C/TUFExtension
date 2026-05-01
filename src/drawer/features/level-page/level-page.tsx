import { useMemo } from "react";
import { CloseButton } from "@drawer/components/close-button";
import { DrawerShell } from "@drawer/drawer-shell";
import { useLevelPage } from "@features/drawer/use-level-page";
import { usePassPage } from "@features/drawer/use-pass-page";
import { PassDetailView } from "@drawer/features/pass-page/pass-detail-view";
import { LevelDetailView } from "./level-detail-view";
import { LevelTabs } from "./components/level-tabs";
import type {
  ResolvedLevelContext,
  ResolvedPassContext,
  ResolvedTufContext
} from "@domain/tuf/types";
import { glowDividerStyle } from "@drawer/shared/level-surface";

interface LevelPageProps {
  activeItemKey: string;
  isOpen: boolean;
  items: ResolvedTufContext[];
  onClose: () => void;
  onSelectItem: (itemKey: string) => void;
}

export function LevelPage({
  activeItemKey,
  isOpen,
  items,
  onClose,
  onSelectItem,
}: LevelPageProps) {
  const activeItem = items.find((item) => item.itemKey === activeItemKey) ?? items[0];

  return (
    <DrawerShell isOpen={isOpen}>
      <div className="relative h-full min-h-0 overflow-hidden bg-[#090909]">
        <main className="absolute inset-0 mt-[5.75rem] overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,#2f0565_0%,#0b0820_34%,#050510_72%)] px-3 pb-5 pt-3">
          {activeItem.kind === "pass" ? (
            <PassDetailContainer item={activeItem} items={items} />
          ) : (
            <LevelDetailContainer item={activeItem} items={items} />
          )}
        </main>
        <nav
          aria-label="TUF drawer navigation"
          className="absolute left-0 right-0 top-0 z-10 w-auto overflow-visible bg-[#08030f]/95 font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
        >
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-3 right-3 h-px"
            style={glowDividerStyle}
          />
          <div className="relative mx-auto flex min-h-16 max-w-[80rem] items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
              <LevelTabs
                activeItemKey={activeItem.itemKey}
                items={items}
                onSelectItem={onSelectItem}
              />
            </div>
            <CloseButton onClick={onClose} />
          </div>
        </nav>
      </div>
    </DrawerShell>
  );
}

function LevelDetailContainer({
  item,
  items
}: {
  item: ResolvedLevelContext;
  items: ResolvedTufContext[];
}) {
  const levels = useMemo(() => items.filter(isLevelContext), [items]);
  const { activeState, retryActiveLevel } = useLevelPage({
    activeLevelId: item.levelId,
    levels
  });

  return <LevelDetailView onRetry={retryActiveLevel} state={activeState} />;
}

function PassDetailContainer({
  item,
  items
}: {
  item: ResolvedPassContext;
  items: ResolvedTufContext[];
}) {
  const passes = useMemo(() => items.filter(isPassContext), [items]);
  const { activeState, retryActivePass } = usePassPage({
    activePassId: item.passId,
    passes
  });

  return <PassDetailView onRetry={retryActivePass} state={activeState} />;
}

function isLevelContext(item: ResolvedTufContext): item is ResolvedLevelContext {
  return item.kind === "level";
}

function isPassContext(item: ResolvedTufContext): item is ResolvedPassContext {
  return item.kind === "pass";
}
