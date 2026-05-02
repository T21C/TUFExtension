import type { PassDetail } from "~/domain/tuf/types";
import {
  formatAccuracy,
  formatScore,
  formatSpeed,
} from "~/drawer/shared/formatters";
import {
  glowDividerStyle,
  panelSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";
import { SpoilerSection, SpoilerText } from "./spoiler-text";

export function PassStatsPanel({ pass }: { pass: PassDetail }) {
  const flags = getFlags(pass);

  return (
    <section
      className={`${panelSurfaceClassName} p-3`}
      style={softGlowBorderStyle}
    >
      <SpoilerSection>
        <div className="grid grid-cols-2 gap-2">
          <StatItem label="Score" value={formatScore(pass.score)} />
          <StatItem label="Accuracy" value={formatAccuracy(pass.accuracy)} />
          <StatItem label="Speed" value={formatSpeed(pass.speed)} />
          <StatItem label="Feeling" value={pass.feelingRating ?? "None"} />
        </div>

        {flags.length > 0 ? (
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
        ) : null}
      </SpoilerSection>
    </section>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-black/25 px-2.5 py-2">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-white/35">
        {label}
      </p>
      <SpoilerText
        as="p"
        className="mt-0.5 block max-w-full truncate text-base font-black text-white"
        title={value}
      >
        {value}
      </SpoilerText>
    </div>
  );
}

function getFlags(pass: PassDetail): string[] {
  const flags: string[] = [];
  if (pass.isWorldsFirst) {
    flags.push("World's First");
  }
  if (pass.is12K) {
    flags.push("12K");
  }
  if (pass.is16K) {
    flags.push("16K");
  }
  if (pass.isNoHoldTap) {
    flags.push("No Hold Tap");
  }
  if (pass.isHidden) {
    flags.push("Hidden");
  }
  if (pass.isDeleted) {
    flags.push("Deleted");
  }
  return flags;
}
