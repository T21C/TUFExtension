import { FlagIcon, YoutubeIcon } from "~/drawer/shared/level-icons";
import type { LeaderboardSortKey, LevelPass } from "~/domain/tuf/types";
import {
  countryToEmoji,
  formatAccuracy,
  formatDate,
  formatScore,
  formatSpeed,
} from "~/drawer/shared/formatters";
import { getPassMetric } from "./leaderboard-sort";
import {
  interactiveSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";

export function LeaderboardRow({
  index,
  pass,
  sortKey,
}: {
  index: number;
  pass: LevelPass;
  sortKey: LeaderboardSortKey;
}) {
  const activeMetric = getPassMetric(pass, sortKey);

  return (
    <div className="relative px-1 py-1.5 transition">
      <div className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 text-5xl font-black italic text-white/[0.04]">
        #{index + 1}
      </div>
      <div className="relative flex items-center gap-2">
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-black/45 ring-1 ring-white/20">
          {pass.playerAvatarUrl ? (
            <img
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
              src={pass.playerAvatarUrl}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-base font-black text-white">
              {pass.playerName}
            </span>
            {pass.country ? (
              <span className="shrink-0 text-sm">
                {countryToEmoji(pass.country)}
              </span>
            ) : null}
          </div>
          <div className="truncate text-xs font-medium text-white/55">
            Feeling: {pass.feelingRating ?? "-"}
          </div>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2 text-sm text-white/70">
        <span>
          <span className="text-white/45">Score: </span>
          <b className="text-white">{formatScore(pass.score)}</b>
        </span>
        <span>
          <span className="text-white/45">Acc: </span>
          {formatAccuracy(pass.accuracy)}
        </span>
        <span>
          <span className="text-white/45">Speed: </span>
          {formatSpeed(pass.speed)}
        </span>
      </div>

      <div className="relative mt-3 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
        <div
          className="grid min-h-9 grid-cols-7 items-center rounded border bg-black/35 px-1 py-1 text-md font-medium tabular-nums backdrop-blur-md"
          style={softGlowBorderStyle}
        >
          <JudgementValue
            className="text-red-500"
            value={pass.judgements.earlyDouble}
          />
          <JudgementValue
            className="text-orange-400"
            value={pass.judgements.earlySingle}
          />
          <JudgementValue
            className="text-yellow-300"
            value={pass.judgements.ePerfect}
          />
          <JudgementValue
            className="text-lime-300"
            value={pass.judgements.perfect}
          />
          <JudgementValue
            className="text-yellow-300"
            value={pass.judgements.lPerfect}
          />
          <JudgementValue
            className="text-orange-400"
            value={pass.judgements.lateSingle}
          />
          <JudgementValue
            className="text-red-500"
            value={pass.judgements.lateDouble}
          />
        </div>
        <a
          aria-label={`${pass.playerName} pass page`}
          className={[
            "grid h-8 w-8 shrink-0 place-items-center",
            interactiveSurfaceClassName,
          ].join(" ")}
          href={`https://tuforums.com/passes/${pass.id}`}
          rel="noreferrer"
          style={softGlowBorderStyle}
          target="_blank"
        >
          <FlagIcon size={19} />
        </a>
        {pass.videoLink ? (
          <a
            aria-label={`${pass.playerName} clear video`}
            className={[
              "grid h-8 w-8 shrink-0 place-items-center",
              interactiveSurfaceClassName,
            ].join(" ")}
            href={pass.videoLink}
            rel="noreferrer"
            style={softGlowBorderStyle}
            target="_blank"
          >
            <YoutubeIcon size={18} />
          </a>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      <div className="relative mt-2 flex items-center justify-between gap-2 text-xs font-semibold text-white/60">
        <span>Feeling: {pass.feelingRating ?? "-"}</span>
        <span>{pass.date ? formatDate(pass.date) : "-"}</span>
      </div>
    </div>
  );
}

function JudgementValue({
  className,
  value,
}: {
  className: string;
  value: number;
}) {
  return (
    <span
      className={[
        "grid min-h-6 min-w-0 place-items-center leading-none",
        className,
      ].join(" ")}
    >
      {value}
    </span>
  );
}
