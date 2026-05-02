import { useMemo } from "react";
import { CloseButton } from "~/drawer/components/close-button";
import { DrawerShell } from "~/drawer/drawer-shell";
import { PinButton } from "~/drawer/components/pin-button";
import { useLevelPage } from "~/features/drawer/use-level-page";
import { usePassPage } from "~/features/drawer/use-pass-page";
import { PassDetailView } from "~/drawer/features/pass-page/pass-detail-view";
import { LevelDetailView } from "./level-detail-view";
import { LevelTabs } from "./components/level-tabs";
import type {
  ResolvedLevelContext,
  ResolvedPassContext,
  ResolvedTufContext,
} from "~/domain/tuf/types";
import { glowDividerStyle } from "~/drawer/shared/level-surface";

interface LevelPageProps {
  activeItemKey: string | null;
  emptyReason: string | null;
  isOpen: boolean;
  isPinned: boolean;
  isResolving: boolean;
  items: ResolvedTufContext[];
  onClose: () => void;
  onSelectItem: (itemKey: string) => void;
  onTogglePinned: () => void;
}

export function LevelPage({
  activeItemKey,
  emptyReason,
  isOpen,
  isPinned,
  isResolving,
  items,
  onClose,
  onSelectItem,
  onTogglePinned,
}: LevelPageProps) {
  const activeItem =
    items.find((item) => item.itemKey === activeItemKey) ?? items[0];

  return (
    <DrawerShell isOpen={isOpen}>
      <div className="relative h-full min-h-0 overflow-hidden bg-[#090909]">
        <main className="absolute inset-0 mt-[5.75rem] flex min-h-0 flex-col overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,#2f0565_0%,#0b0820_34%,#050510_72%)] px-3 pb-5 pt-3">
          {!activeItem ? (
            <DrawerStatusView
              description={emptyReason}
              isResolving={isResolving}
            />
          ) : activeItem.kind === "pass" ? (
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
              {activeItem ? (
                <LevelTabs
                  activeItemKey={activeItem.itemKey}
                  items={items}
                  onSelectItem={onSelectItem}
                />
              ) : (
                <div className="px-1 text-xs font-black uppercase tracking-[0.24em] text-white/35">
                  TUF drawer
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <PinButton isPinned={isPinned} onClick={onTogglePinned} />
              <CloseButton onClick={onClose} />
            </div>
          </div>
        </nav>
      </div>
    </DrawerShell>
  );
}

function LevelDetailContainer({
  item,
  items,
}: {
  item: ResolvedLevelContext;
  items: ResolvedTufContext[];
}) {
  const levels = useMemo(() => items.filter(isLevelContext), [items]);
  const { activeState, retryActiveLevel } = useLevelPage({
    activeLevelId: item.levelId,
    levels,
  });

  return <LevelDetailView onRetry={retryActiveLevel} state={activeState} />;
}

function PassDetailContainer({
  item,
  items,
}: {
  item: ResolvedPassContext;
  items: ResolvedTufContext[];
}) {
  const passes = useMemo(() => items.filter(isPassContext), [items]);
  const { activeState, retryActivePass } = usePassPage({
    activePassId: item.passId,
    passes,
  });

  return <PassDetailView onRetry={retryActivePass} state={activeState} />;
}

function DrawerStatusView({
  description,
  isResolving,
}: {
  description: string | null;
  isResolving: boolean;
}) {
  return (
    <section className="grid flex-1 place-items-center px-4 py-8 text-center">
      <div className="flex max-w-sm flex-col items-center justify-center">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-200/60">
          {isResolving ? "Refreshing" : "No result"}
        </p>
        <h2 className="mt-2 text-xl font-black text-white">
          {isResolving ? "Looking for TUF data" : "No TUF result"}
        </h2>
        <p className="mt-2 text-sm font-semibold text-white/45">
          {description ??
            (isResolving
              ? "The drawer is pinned, so it will update as soon as this video resolves."
              : "This video does not have a matched TUF level or pass.")}
        </p>
      </div>
    </section>
  );
}

function isLevelContext(
  item: ResolvedTufContext,
): item is ResolvedLevelContext {
  return item.kind === "level";
}

function isPassContext(item: ResolvedTufContext): item is ResolvedPassContext {
  return item.kind === "pass";
}
