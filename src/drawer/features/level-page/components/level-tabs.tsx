import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconImage } from "~/drawer/components/icon-image";
import type { ResolvedTufContext } from "~/domain/tuf/types";
import { glowDividerStyle } from "~/drawer/shared/level-surface";

interface LevelTabsProps {
  activeItemKey: string;
  items: ResolvedTufContext[];
  onSelectItem: (itemKey: string) => void;
}

export function LevelTabs({
  activeItemKey,
  items,
  onSelectItem,
}: LevelTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [scrollHint, setScrollHint] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateScrollHint = useCallback(() => {
    const element = tabsRef.current;

    if (!element) {
      setScrollHint({ canScrollLeft: false, canScrollRight: false });
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    const hasOverflow = maxScrollLeft > 1;
    const canScrollLeft = hasOverflow && element.scrollLeft > 1;
    const canScrollRight =
      hasOverflow && element.scrollLeft < maxScrollLeft - 1;

    setScrollHint((current) =>
      current.canScrollLeft === canScrollLeft &&
      current.canScrollRight === canScrollRight
        ? current
        : { canScrollLeft, canScrollRight },
    );
  }, []);

  useEffect(() => {
    const element = tabsRef.current;

    if (!element) {
      return;
    }

    updateScrollHint();

    const animationFrame = window.requestAnimationFrame(updateScrollHint);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateScrollHint);

    element.addEventListener("scroll", updateScrollHint, { passive: true });
    resizeObserver?.observe(element);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      element.removeEventListener("scroll", updateScrollHint);
      resizeObserver?.disconnect();
    };
  }, [items.length, updateScrollHint]);

  return (
    <div className="relative flex h-11 min-w-0 flex-1 items-center">
      {scrollHint.canScrollLeft ? <ScrollChevron direction="left" /> : null}
      {scrollHint.canScrollRight ? <ScrollChevron direction="right" /> : null}
      <div
        aria-label="TUF results"
        className="flex h-11 min-w-0 flex-1 list-none items-center gap-1.5 overflow-x-auto overflow-y-hidden p-1 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-tuf-tabs-scroll="true"
        ref={tabsRef}
        role="tablist"
      >
        {items.map((item) => {
          const isActive = item.itemKey === activeItemKey;

          return (
            <button
              aria-selected={isActive}
              className={[
                "group relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-md border border-transparent bg-transparent p-1 transition",
                isActive ? "text-white" : "text-white/35 hover:text-white/75",
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
    </div>
  );
}

function ScrollChevron({ direction }: { direction: "left" | "right" }) {
  const isLeft = direction === "left";

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-y-0 z-10 grid w-5 place-items-center",
        isLeft
          ? "left-0 bg-gradient-to-r from-[#08030f] to-transparent"
          : "right-0 bg-gradient-to-l from-[#08030f] to-transparent",
      ].join(" ")}
    >
      <motion.svg
        animate={{ x: isLeft ? [-1, -4, -1] : [1, 4, 1] }}
        className="h-3.5 w-3.5 text-violet-100/75 drop-shadow-[0_0_8px_rgba(196,181,253,0.5)]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        transition={{
          duration: 1.1,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        viewBox="0 0 24 24"
      >
        <path d={isLeft ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
      </motion.svg>
    </div>
  );
}
