import type { PassDetail } from "@domain/tuf/types";
import {
  countryToEmoji,
  formatDate,
  formatNumber
} from "@drawer/shared/formatters";
import {
  glowDividerStyle,
  panelSurfaceClassName,
  softGlowBorderStyle
} from "@drawer/shared/level-surface";
import { SpoilerSection, SpoilerText } from "./spoiler-text";

export function PassPlayerCard({ pass }: { pass: PassDetail }) {
  const rankColor = getRankColor(pass.player.rankedScoreRank);

  return (
    <section className={`${panelSurfaceClassName} p-3`} style={softGlowBorderStyle}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-black/35">
          {pass.player.avatarUrl ? (
            <img
              alt={pass.player.name}
              className="h-full w-full object-cover"
              src={pass.player.avatarUrl}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-lg font-black text-white">{pass.player.name}</h2>
            {pass.player.country ? (
              <span className="text-sm">{countryToEmoji(pass.player.country)}</span>
            ) : null}
          </div>
          <p className="truncate text-xs font-bold text-white/45">
            {pass.player.discordUsername ? `@${pass.player.discordUsername}` : "TUF player"}
          </p>
        </div>
        {typeof pass.player.rankedScoreRank === "number" ? (
          <span
            className="rounded-md px-2 py-1 text-xs font-black"
            style={{
              backgroundColor: `${rankColor}24`,
              color: rankColor
            }}
          >
            #{pass.player.rankedScoreRank}
          </span>
        ) : null}
      </div>

      <div className="my-3 h-px" style={glowDividerStyle} />

      <SpoilerSection>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoLine label="Clear Date" value={formatDate(pass.date ?? "")} />
          <InfoLine isSpoiler label="Score" value={formatNumber(pass.score)} />
          {pass.scoreInfo?.currentRankedScore ? (
            <InfoLine
              isSpoiler
              label="Ranked Score"
              value={formatNumber(pass.scoreInfo.currentRankedScore)}
            />
          ) : null}
          {pass.scoreInfo?.impact ? (
            <InfoLine
              isSpoiler
              label="Impact"
              value={`+${formatNumber(pass.scoreInfo.impact)}`}
            />
          ) : null}
        </div>
      </SpoilerSection>
    </section>
  );
}

function InfoLine({
  isSpoiler = false,
  label,
  value
}: {
  isSpoiler?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-black/25 px-2 py-2">
      <p className="font-black uppercase tracking-[0.08em] text-white/35">{label}</p>
      {isSpoiler ? (
        <SpoilerText as="p" className="mt-0.5 truncate text-sm font-black text-white">
          {value || "-"}
        </SpoilerText>
      ) : (
        <p className="mt-0.5 truncate text-sm font-black text-white">{value || "-"}</p>
      )}
    </div>
  );
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
