import type { PassJudgements } from "~/domain/tuf/types";
import {
  glowDividerStyle,
  panelSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";
import { SpoilerSection, SpoilerText } from "./spoiler-text";

const JUDGEMENT_CELLS = [
  { key: "earlyDouble", color: "#ff3045", label: "Too Early" },
  { key: "earlySingle", color: "#ff9b19", label: "Early" },
  { key: "ePerfect", color: "#fff131", label: "E-Perfect" },
  { key: "perfect", color: "#82ff68", label: "Perfect" },
  { key: "lPerfect", color: "#fff131", label: "L-Perfect" },
  { key: "lateSingle", color: "#ff9b19", label: "Late" },
  { key: "lateDouble", color: "#ff3045", label: "Too Late" },
] as const;

export function PassJudgementsPanel({
  judgements,
}: {
  judgements: PassJudgements;
}) {
  return (
    <section
      className={`${panelSurfaceClassName} p-3`}
      style={softGlowBorderStyle}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-white">Judgements</h2>
        <span className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
          Clear details
        </span>
      </div>
      <div className="my-3 h-px" style={glowDividerStyle} />
      <SpoilerSection>
        <div className="grid grid-cols-7 gap-1.5 rounded-md bg-violet-500/45 p-1.5">
          {JUDGEMENT_CELLS.map((cell) => (
            <div
              className="grid min-h-9 place-items-center rounded bg-black/18 px-1 text-center"
              key={cell.key}
              title={cell.label}
            >
              <SpoilerText
                className="tabular-nums leading-none text-sm font-black drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
                style={{ color: cell.color }}
              >
                {judgements[cell.key]}
              </SpoilerText>
            </div>
          ))}
        </div>
      </SpoilerSection>
    </section>
  );
}
