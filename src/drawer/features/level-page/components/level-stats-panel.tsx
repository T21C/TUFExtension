import type { LevelPageData } from "@domain/tuf/types";
import type { LevelLikeController } from "@features/drawer/use-level-like";
import { formatInteger } from "@drawer/shared/formatters";
import {
  glowDividerStyle,
  panelSurfaceClassName,
  verticalGlowDividerStyle,
} from "@drawer/shared/level-surface";

export function LevelStatsPanel({
  data,
  likeController
}: {
  data: LevelPageData;
  likeController: LevelLikeController;
}) {
  const stats = data.stats;

  return (
    <section className={["overflow-hidden p-3", panelSurfaceClassName].join(" ")}>
      <div aria-hidden="true" className="mb-3 h-px" style={glowDividerStyle} />
      <div className="flex justify-between">
        <GridStat label="Likes" value={formatInteger(likeController.likes)} />
        <div aria-hidden="true" className="mx-2 w-px shrink-0" style={verticalGlowDividerStyle} />
        <GridStat
          label="Downloads"
          value={formatInteger(data.level.downloadCount ?? 0)}
        />
        <div aria-hidden="true" className="mx-2 w-px shrink-0" style={verticalGlowDividerStyle} />
        <GridStat label="Clears" value={formatInteger(stats.totalClears)} />
      </div>
      <div aria-hidden="true" className="mt-3 h-px" style={glowDividerStyle} />
    </section>
  );
}

function GridStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-shrink justify-start items-center gap-2">
      <div className="text-xs font-medium uppercase text-white/55">
        {label}
      </div>
      <div className="truncate text-xl font-black leading-none text-white">
        {value}
      </div>
    </div>
  );
}
