import { IconImage } from "@drawer/components/icon-image";
import type { ResolvedLevelContext } from "@domain/tuf/types";

interface LevelTabsProps {
  activeLevelId: string;
  levels: ResolvedLevelContext[];
  onSelectLevel: (levelId: string) => void;
}

export function LevelTabs({
  activeLevelId,
  levels,
  onSelectLevel
}: LevelTabsProps) {
  return (
    <div
      aria-label="TUF level results"
      className="flex min-h-11 min-w-0 flex-1 list-none items-center gap-2 overflow-x-auto overflow-y-hidden pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {levels.map((level) => {
        const isActive = level.levelId === activeLevelId;

        return (
          <button
            aria-selected={isActive}
            className={[
              "group relative grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full border border-transparent bg-transparent p-1 transition",
              isActive
                ? "border-[#8d70ff]/45 bg-white/10 text-white shadow-[0_0_14px_rgba(141,112,255,0.28)]"
                : "text-white/45 hover:bg-white/5 hover:text-white/75",
            ].join(" ")}
            key={level.levelId}
            onClick={() => onSelectLevel(level.levelId)}
            role="tab"
            title={level.title}
            type="button"
          >
            {level.tabIconUrl ? (
              <IconImage
                alt={level.tabIconAlt}
                isActive={isActive}
                src={level.tabIconUrl}
              />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-black">
                {level.title.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
