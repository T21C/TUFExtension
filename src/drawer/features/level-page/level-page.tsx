import { CloseButton } from "@drawer/components/close-button";
import { DrawerShell } from "@drawer/drawer-shell";
import { useLevelPage } from "@features/drawer/use-level-page";
import { LevelDetailView } from "./level-detail-view";
import { LevelTabs } from "./level-tabs";
import type { ResolvedLevelContext } from "@domain/tuf/types";

interface LevelPageProps {
  activeLevelId: string;
  isOpen: boolean;
  levels: ResolvedLevelContext[];
  onClose: () => void;
  onSelectLevel: (levelId: string) => void;
}

export function LevelPage({
  activeLevelId,
  isOpen,
  levels,
  onClose,
  onSelectLevel,
}: LevelPageProps) {
  const { activeLevel, activeState, retryActiveLevel } = useLevelPage({
    activeLevelId,
    levels
  });

  return (
    <DrawerShell isOpen={isOpen}>
      <div className="relative h-full min-h-0 overflow-hidden bg-[#090909]">
        <main className="absolute inset-0 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,#2f0565_0%,#0b0820_34%,#050510_72%)] px-3 pb-5 pt-[5.75rem]">
          <LevelDetailView onRetry={retryActiveLevel} state={activeState} />
        </main>
        <nav
          aria-label="TUF drawer navigation"
          className="absolute left-0 right-0 top-0 z-10 w-auto overflow-visible border-b border-white/10 bg-[rgba(249,250,251,0.05)] font-medium text-white shadow-[0_4px_6px_rgba(9,9,9,0.1)] backdrop-blur-[24px]"
        >
          <div className="relative mx-auto flex min-h-16 max-w-[80rem] items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
              <LevelTabs
                activeLevelId={activeLevel.levelId}
                levels={levels}
                onSelectLevel={onSelectLevel}
              />
            </div>
            <CloseButton onClick={onClose} />
          </div>
        </nav>
      </div>
    </DrawerShell>
  );
}
