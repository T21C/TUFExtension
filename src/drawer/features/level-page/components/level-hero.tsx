import type { ReactNode } from "react";
import {
  ChartIcon,
  HeartIcon,
  MetronomeIcon,
  TimeIcon,
} from "~/drawer/shared/level-icons";
import type { LevelPageData } from "~/domain/tuf/types";
import type { LevelLikeController } from "~/features/drawer/use-level-like";
import { t } from "~/platform/chrome/i18n";
import {
  formatBaseScore,
  formatDuration,
  formatInteger,
  formatNumber,
} from "~/drawer/shared/formatters";
import {
  glowBorderStyle,
  interactiveSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";

export function LevelHero({
  data,
  likeController,
}: {
  data: LevelPageData;
  likeController: LevelLikeController;
}) {
  const { level } = data;
  const title = level.song;
  const creatorLine = [level.creator, level.artist].filter(Boolean).join(" - ");
  const ratingDifficulty = getOverlayRatingDifficulty(data);

  return (
    <section
      className="relative isolate overflow-hidden rounded-md border bg-[#050510] bg-cover bg-center bg-no-repeat [background-clip:padding-box]"
      style={{
        backgroundImage: data.thumbnailUrl
          ? `url(${data.thumbnailUrl})`
          : undefined,
        ...glowBorderStyle,
      }}
    >
      <div className="absolute inset-0 bg-[#000d] blur-[8px] brightness-[0.8]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(151,0,255,0.26),transparent_42%)]" />
      <div className="relative flex min-h-[310px] flex-col p-5">
        <div className="flex items-start gap-4">
          <div className="flex w-[82px] shrink-0 flex-col items-center gap-2.5">
            <div className="relative">
              {data.difficulty.icon ? (
                <img
                  alt={data.difficulty.name ?? t("difficultyFallback")}
                  className="h-16 w-16 object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]"
                  decoding="async"
                  src={data.difficulty.icon}
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#d91290] text-2xl font-black">
                  {data.difficulty.name ?? "?"}
                </div>
              )}
              {ratingDifficulty?.icon ? (
                <img
                  alt={
                    ratingDifficulty.name ?? t("estimatedDifficultyFallback")
                  }
                  className="absolute h-8 w-8 rounded-full border border-white/35 bg-black/40 object-contain backdrop-blur-md drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]"
                  decoding="async"
                  src={ratingDifficulty.icon}
                  style={{
                    left: "-0.5rem",
                    top: "-0.5rem",
                  }}
                  title={ratingDifficulty.name}
                />
              ) : null}
            </div>
            <div
              className="rounded border bg-black/35 px-2.5 py-1 text-sm font-black leading-none text-white backdrop-blur-md"
              style={softGlowBorderStyle}
            >
              {formatBaseScore(level.pp ?? data.difficulty.baseScore ?? 0)}PP
            </div>
            <div className="text-sm font-black text-white/45">#{level.id}</div>
            <HeroCurationIcons data={data} />
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h1
              className="break-words text-[clamp(2.25rem,7vw,3.35rem)] font-bold leading-[1] tracking-normal text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
              title={title}
            >
              {title}
            </h1>
            {creatorLine ? (
              <p className="mt-3 truncate text-lg font-medium text-white/85">
                {creatorLine}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {level.levelLengthInMs ? (
                <MetricChip
                  icon={<TimeIcon />}
                  value={formatDuration(level.levelLengthInMs)}
                />
              ) : null}
              {level.tilecount ? (
                <MetricChip
                  icon={<ChartIcon />}
                  value={formatInteger(level.tilecount)}
                />
              ) : null}
              {level.bpm ? (
                <MetricChip
                  icon={<MetronomeIcon />}
                  value={formatNumber(level.bpm)}
                />
              ) : null}
            </div>
            <div className="mt-3">
              <IconRow data={data} />
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-end gap-6">
          <div className="flex shrink-0 items-center gap-1.5 text-2xl font-black text-white">
            <span>{formatInteger(likeController.likes)}</span>
            <HeartIcon
              className={likeController.liked ? "text-[#ff2222]" : "text-white"}
              filled={likeController.liked}
              size={22}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function getOverlayRatingDifficulty(data: LevelPageData) {
  if (
    data.ratingDifficulty?.icon &&
    data.ratingDifficulty.type === "PGU" &&
    data.difficulty.name?.includes("Q")
  ) {
    return data.ratingDifficulty;
  }

  return undefined;
}

function HeroCurationIcons({ data }: { data: LevelPageData }) {
  const curationTypes = (data.curation?.types ?? []).slice(0, 4);
  const iconClassName = getHeroCurationIconClassName(curationTypes.length);
  const cellClassName = getHeroCurationCellClassName(curationTypes.length);

  if (curationTypes.length === 0) {
    return null;
  }

  return (
    <div
      className="flex w-full flex-col items-center gap-1 pt-1"
      title={curationTypes.map((type) => type.name).join(", ")}
    >
      {curationTypes.map((type) => (
        <div
          className={["grid place-items-center", cellClassName].join(" ")}
          key={type.id}
          title={type.name}
        >
          {type.icon ? (
            <img
              alt={type.name}
              className={[
                "object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]",
                iconClassName,
              ].join(" ")}
              decoding="async"
              src={type.icon}
            />
          ) : (
            <span className="text-lg font-black">
              {type.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function getHeroCurationCellClassName(count: number): string {
  if (count <= 2) {
    return "h-12 w-12";
  }

  return "h-10 w-10";
}

function getHeroCurationIconClassName(count: number): string {
  if (count <= 1) {
    return "h-14 w-14";
  }

  if (count === 2) {
    return "h-12 w-12";
  }

  if (count === 3) {
    return "h-10 w-10";
  }

  return "h-9 w-9";
}

function MetricChip({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div
      className="flex min-w-[4.6rem] items-center justify-center gap-1.5 rounded border bg-black/35 px-2.5 py-1.5 text-sm font-black text-white backdrop-blur-md"
      style={softGlowBorderStyle}
    >
      <span className="text-white/95">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function IconRow({ data }: { data: LevelPageData }) {
  const icons = data.level.tags.map((tag) => ({
    alt: tag.name,
    color: tag.color,
    icon: tag.icon,
    id: `tag-${tag.id}`,
    name: tag.name,
  }));

  if (icons.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {icons.map((item) => (
        <div
          className={[
            "grid h-8 w-8 place-items-center",
            interactiveSurfaceClassName,
          ].join(" ")}
          key={item.id}
          style={{
            borderColor: item.color,
            color: item.color,
          }}
          title={item.name}
        >
          {item.icon ? (
            <img
              alt={item.alt}
              className="h-6 w-6 object-contain"
              decoding="async"
              src={item.icon}
            />
          ) : (
            <span className="text-sm font-black">
              {item.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
