import type { LevelPageData } from "@domain/tuf/types";
import type { LevelLikeController } from "@features/drawer/use-level-like";
import { formatInteger } from "./formatters";

export function LevelStatsPanel({
  data,
  likeController
}: {
  data: LevelPageData;
  likeController: LevelLikeController;
}) {
  const stats = data.stats;

  return (
    <section className="rounded-md border border-[#8b00ff55] bg-white/10 p-3 shadow-[0_0_22px_rgba(47,5,101,0.18)] backdrop-blur-xl">
      <div className="flex justify-between">
        <GridStat label="Likes" value={formatInteger(likeController.likes)} />
        <GridStat
          label="Downloads"
          value={formatInteger(data.level.downloadCount ?? 0)}
        />
        <GridStat label="Clears" value={formatInteger(stats.totalClears)} />
      </div>
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
