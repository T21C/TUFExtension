import { useMemo, useState } from "react";
import { CloseButton } from "~/drawer/components/close-button";
import { DrawerShell } from "~/drawer/drawer-shell";
import { DrawerControlsToggleButton } from "~/drawer/components/drawer-controls-toggle-button";
import { LanguageToggleButton } from "~/drawer/components/language-toggle-button";
import { PinButton } from "~/drawer/components/pin-button";
import { SpoilerToggleButton } from "~/drawer/components/spoiler-toggle-button";
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
import { t, type SupportedLanguage } from "~/platform/chrome/i18n";

interface LevelPageProps {
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

export function LevelPage({
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
}: LevelPageProps) {
  const [areDrawerControlsOpen, setAreDrawerControlsOpen] = useState(false);
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
            <PassDetailContainer
              isSpoilerProtectionDisabled={isSpoilerProtectionDisabled}
              item={activeItem}
              items={items}
            />
          ) : (
            <LevelDetailContainer item={activeItem} items={items} />
          )}
        </main>
        <nav
          aria-label={t("drawerNavigation")}
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
                <div className="px-1 text-xs font-bold text-white/35">
                  {t("tufExtension")}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="flex items-center">
                <div
                  className={[
                    "flex items-center gap-1 overflow-hidden transition-all duration-200",
                    areDrawerControlsOpen
                      ? "mr-1 w-32 opacity-100"
                      : "w-0 opacity-0",
                  ].join(" ")}
                >
                  <PinButton isPinned={isPinned} onClick={onTogglePinned} />
                  <LanguageToggleButton
                    language={language}
                    onClick={onToggleLanguage}
                  />
                  <SpoilerToggleButton
                    isDisabled={isSpoilerProtectionDisabled}
                    onClick={onToggleSpoilerProtection}
                  />
                </div>
                <DrawerControlsToggleButton
                  isOpen={areDrawerControlsOpen}
                  onClick={() => setAreDrawerControlsOpen((isOpen) => !isOpen)}
                />
              </div>
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
  isSpoilerProtectionDisabled,
  item,
  items,
}: {
  isSpoilerProtectionDisabled: boolean;
  item: ResolvedPassContext;
  items: ResolvedTufContext[];
}) {
  const passes = useMemo(() => items.filter(isPassContext), [items]);
  const { activeState, retryActivePass } = usePassPage({
    activePassId: item.passId,
    passes,
  });

  return (
    <PassDetailView
      isSpoilerProtectionDisabled={isSpoilerProtectionDisabled}
      onRetry={retryActivePass}
      state={activeState}
    />
  );
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
          {isResolving ? t("refreshing") : t("noResult")}
        </p>
        <h2 className="mt-2 text-xl font-black text-white">
          {isResolving ? t("lookingForTufData") : t("noTufResult")}
        </h2>
        <p className="mt-2 text-sm font-semibold text-white/45">
          {description ??
            (isResolving
              ? t("pinnedRefreshDescription")
              : t("noMatchedResultDescription"))}
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
