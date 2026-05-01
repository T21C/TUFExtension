import { IconImage } from "@drawer/components/icon-image";
import type { ResolvedTufContext } from "@domain/tuf/types";
import { glowDividerStyle } from "@drawer/shared/level-surface";

interface LevelTabsProps {
  activeItemKey: string;
  items: ResolvedTufContext[];
  onSelectItem: (itemKey: string) => void;
}

export function LevelTabs({
  activeItemKey,
  items,
  onSelectItem
}: LevelTabsProps) {
  return (
    <div
      aria-label="TUF results"
      className="flex min-h-11 min-w-0 flex-1 list-none items-center gap-1.5 overflow-x-auto overflow-y-hidden p-1 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.itemKey === activeItemKey;

        return (
          <button
            aria-selected={isActive}
            className={[
              "group relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-md border border-transparent bg-transparent p-1 transition",
              isActive
                ? "text-white"
                : "text-white/35 hover:text-white/75",
            ].join(" ")}
            key={item.itemKey}
            onClick={() => onSelectItem(item.itemKey)}
            role="tab"
            title={item.title}
            type="button"
          >
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-1 right-1 h-px"
                style={glowDividerStyle}
              />
            ) : null}
            {item.tabIconUrl ? (
              <IconImage
                alt={item.tabIconAlt}
                isActive={isActive}
                src={item.tabIconUrl}
              />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-black">
                {item.title.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
