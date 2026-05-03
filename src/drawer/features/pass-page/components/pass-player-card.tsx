import type { PassDetail } from "~/domain/tuf/types";
import {
  countryToEmoji,
  formatNumber,
  formatScore,
} from "~/drawer/shared/formatters";
import {
  glowDividerStyle,
  panelSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";
import { t } from "~/platform/chrome/i18n";
import { SpoilerSection, SpoilerText } from "./spoiler-text";

export function PassPlayerCard({ pass }: { pass: PassDetail }) {
  const rankColor = getRankColor(pass.player.rankedScoreRank);
  const playerProfileUrl =
    pass.player.profileUrl ??
    (pass.player.id
      ? `https://tuforums.com/profile/${pass.player.id}`
      : undefined);
  const PlayerHeader = playerProfileUrl ? "a" : "div";

  return (
    <section
      className={`${panelSurfaceClassName} p-3`}
      style={softGlowBorderStyle}
    >
      <PlayerHeader
        className={[
          "flex items-center gap-3 rounded-lg",
          playerProfileUrl
            ? "transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
            : "",
        ].join(" ")}
        href={playerProfileUrl}
        rel={playerProfileUrl ? "noreferrer" : undefined}
        target={playerProfileUrl ? "_blank" : undefined}
      >
        <div className="h-12 w-12 overflow-hidden rounded-full bg-black/35">
          {pass.player.avatarUrl ? (
            <img
              alt={pass.player.name}
              className="h-full w-full object-cover"
              src={pass.player.avatarUrl}
            />
          ) : null}
        </div>
        <div className="min-w-0 max-w-[12rem] shrink">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-lg font-black text-white">
              {pass.player.name}
            </h2>
            {pass.player.country ? (
              <span className="text-sm">
                {countryToEmoji(pass.player.country)}
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs font-bold text-white/45">
            {pass.player.discordUsername
              ? `@${pass.player.discordUsername}`
              : t("tufPlayer")}
          </p>
        </div>
        <PlayerScoreSummary pass={pass} />
        {typeof pass.player.rankedScoreRank === "number" ? (
          <span
            className="ml-auto rounded-md px-2 py-1 text-xs font-black"
            style={{
              backgroundColor: `${rankColor}24`,
              color: rankColor,
            }}
          >
            #{pass.player.rankedScoreRank}
          </span>
        ) : null}
      </PlayerHeader>

      <div className="my-3 h-px" style={glowDividerStyle} />

      <SpoilerSection>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoLine
            isSpoiler
            label={t("score")}
            value={formatScore(pass.score)}
          />
          <InfoLine
            isSpoiler
            label={t("feeling")}
            value={pass.feelingRating ?? t("none")}
          />
        </div>
        <PassFlags pass={pass} />
      </SpoilerSection>
    </section>
  );
}

function PlayerScoreSummary({ pass }: { pass: PassDetail }) {
  const rankedScore = pass.scoreInfo?.currentRankedScore;
  const impact = pass.scoreInfo?.impact;

  if (typeof rankedScore !== "number" && typeof impact !== "number") {
    return null;
  }

  return (
    <div className="flex min-w-0 shrink-0 items-center justify-start gap-1">
      {typeof rankedScore === "number" ? (
        <ProfileMetric value={formatNumber(rankedScore)} variant="ranked" />
      ) : null}
      {typeof impact === "number" ? (
        <ProfileMetric value={formatImpact(impact)} />
      ) : null}
    </div>
  );
}

function ProfileMetric({
  value,
  variant = "impact",
}: {
  value: string;
  variant?: "impact" | "ranked";
}) {
  const isImpact = variant === "impact";

  return (
    <div
      className={[
        "min-w-0 rounded-md border px-2 py-1 text-right shadow-[0_0_14px_rgba(0,0,0,0.22)] backdrop-blur-md",
        isImpact
          ? "border-emerald-300/15 bg-emerald-400/18"
          : "border-violet-300/15 bg-black/30",
      ].join(" ")}
    >
      <SpoilerText
        as="p"
        className={[
          "min-w-0 truncate font-black leading-none tabular-nums",
          isImpact
            ? "text-xs text-emerald-300 drop-shadow-[0_0_8px_rgba(74,222,128,0.55)]"
            : "text-md text-violet-100",
        ].join(" ")}
      >
        {value}
      </SpoilerText>
    </div>
  );
}

function PassFlags({ pass }: { pass: PassDetail }) {
  const flags = getFlags(pass);

  if (flags.length === 0) {
    return null;
  }

  return (
    <>
      <div className="my-3 h-px" style={glowDividerStyle} />
      <div className="flex flex-wrap gap-1.5">
        {flags.map((flag) => (
          <span
            className="rounded-md border border-violet-400/25 bg-black/30 px-2 py-1 text-xs font-black text-violet-100 shadow-[0_0_12px_rgba(168,85,247,0.18)]"
            key={flag}
          >
            <SpoilerText>{flag}</SpoilerText>
          </span>
        ))}
      </div>
    </>
  );
}

function InfoLine({
  isSpoiler = false,
  label,
  value,
}: {
  isSpoiler?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-black/25 px-2 py-2">
      <p className="font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </p>
      {isSpoiler ? (
        <SpoilerText
          as="p"
          className="mt-0.5 truncate text-sm font-black text-white"
        >
          {value || "-"}
        </SpoilerText>
      ) : (
        <p className="mt-0.5 truncate text-sm font-black text-white">
          {value || "-"}
        </p>
      )}
    </div>
  );
}

function formatImpact(impact: number): string {
  if (impact === 0) {
    return "-";
  }

  return `${impact > 0 ? "+" : ""}${formatNumber(impact)}`;
}

function getRankColor(rank: number | undefined): string {
  switch (rank) {
    case 1:
      return "#efff63";
    case 2:
      return "#eeeeee";
    case 3:
      return "#ff834a";
    default:
      return "#a3a3a3";
  }
}

function getFlags(pass: PassDetail): string[] {
  const flags: string[] = [];
  if (pass.isWorldsFirst) {
    flags.push(t("worldsFirst"));
  }
  if (pass.is12K) {
    flags.push(t("twelveK"));
  }
  if (pass.is16K) {
    flags.push(t("sixteenK"));
  }
  if (pass.isNoHoldTap) {
    flags.push(t("noHoldTap"));
  }
  if (pass.isHidden) {
    flags.push(t("hidden"));
  }
  if (pass.isDeleted) {
    flags.push(t("deleted"));
  }
  return flags;
}
