import type { ReactNode } from "react";
import type { PassPageData } from "~/domain/tuf/types";
import {
  CalendarIcon,
  ChartIcon,
  SpeedIcon,
  TufIcon,
} from "~/drawer/shared/level-icons";
import {
  formatAccuracy,
  formatBaseScore,
  formatDate,
  formatScore,
  formatSpeed,
} from "~/drawer/shared/formatters";
import {
  glowBorderStyle,
  mutedSurfaceClassName,
  panelSurfaceClassName,
} from "~/drawer/shared/level-surface";
import { SpoilerSection, SpoilerText } from "./spoiler-text";

export function PassHero({ data }: { data: PassPageData }) {
  const { pass } = data;
  const difficulty = pass.level.difficulty;
  const baseScore = pass.level.baseScore ?? difficulty?.baseScore ?? 0;
  const backgroundImage = data.thumbnailUrl
    ? `linear-gradient(90deg, rgba(0,0,0,0.92), rgba(14,5,28,0.82)), url(${data.thumbnailUrl})`
    : "linear-gradient(135deg, rgba(47,5,101,0.68), rgba(0,0,0,0.92))";

  return (
    <section
      className={`${panelSurfaceClassName} relative min-h-[15.5rem] overflow-hidden p-4`}
      style={{
        ...glowBorderStyle,
        backgroundImage,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="relative flex gap-4">
        <div className="flex w-20 shrink-0 flex-col items-center gap-2">
          {difficulty?.icon ? (
            <img
              alt={difficulty.name ?? "Difficulty"}
              className="h-16 w-16 rounded-full object-contain drop-shadow-[0_0_16px_rgba(168,85,247,0.38)]"
              src={difficulty.icon}
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-black/40">
              <TufIcon size={34} />
            </div>
          )}
          <span className="rounded-md bg-black/55 px-2.5 py-1 text-sm font-black text-white shadow-[0_0_14px_rgba(168,85,247,0.2)]">
            {formatBaseScore(baseScore)}PP
          </span>
          {pass.level.id ? (
            <span className="text-xs font-black text-white/45">
              #{pass.level.id}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-200/55">
            Passed Clear
          </p>
          <h1 className="mt-1 break-words text-3xl font-black leading-[0.98] text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]">
            {pass.level.song}
          </h1>
          <p className="mt-2 line-clamp-2 text-base font-extrabold text-white/75">
            {getCreditsText(pass)}
            {pass.level.artist ? ` - ${pass.level.artist}` : ""}
          </p>

          <SpoilerSection>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <HeroMetric
                icon={<ChartIcon size={16} />}
                label={formatScore(pass.score)}
              />
              <HeroMetric
                icon={<CalendarIcon size={16} />}
                label={formatDate(pass.date ?? "")}
              />
              <HeroMetric
                icon={<SpeedIcon size={16} />}
                isSpoiler
                label={formatSpeed(pass.speed)}
              />
              <HeroMetric isSpoiler label={formatAccuracy(pass.accuracy)} />
            </div>
          </SpoilerSection>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon,
  isSpoiler = false,
  label,
}: {
  icon?: ReactNode;
  isSpoiler?: boolean;
  label: string;
}) {
  return (
    <div
      className={`${mutedSurfaceClassName} flex min-w-0 items-center justify-center gap-1.5 px-2 py-2 text-sm font-black text-white`}
    >
      {icon}
      {isSpoiler ? (
        <SpoilerText className="min-w-0 truncate">{label || "-"}</SpoilerText>
      ) : (
        <span className="min-w-0 truncate">{label || "-"}</span>
      )}
    </div>
  );
}

function getCreditsText(data: PassPageData["pass"]): string {
  const parts = [data.level.team, data.level.charter, data.level.vfxer].filter(
    Boolean,
  );

  return parts.length > 0 ? parts.join(" | ") : "Unknown credits";
}
