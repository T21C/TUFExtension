import type { PassJudgements } from "~/domain/tuf/types";
import {
  glowDividerStyle,
  panelSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";
import { t } from "~/platform/chrome/i18n";
import { SpoilerSection, SpoilerText } from "./spoiler-text";

const JUDGEMENT_CELLS = [
  { key: "earlyDouble", className: "text-red-500", labelKey: "tooEarly" },
  { key: "earlySingle", className: "text-orange-400", labelKey: "early" },
  { key: "ePerfect", className: "text-yellow-300", labelKey: "ePerfect" },
  { key: "perfect", className: "text-lime-300", labelKey: "perfect" },
  { key: "lPerfect", className: "text-yellow-300", labelKey: "lPerfect" },
  { key: "lateSingle", className: "text-orange-400", labelKey: "late" },
  { key: "lateDouble", className: "text-red-500", labelKey: "tooLate" },
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
        <h2 className="text-lg font-black text-white">{t("judgements")}</h2>
        <span className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
          {t("clearDetails")}
        </span>
      </div>
      <div className="my-3 h-px" style={glowDividerStyle} />
      <SpoilerSection>
        <div
          className="grid min-h-9 grid-cols-7 items-center rounded border bg-black/35 px-1 py-1 text-md font-medium tabular-nums backdrop-blur-md"
          style={softGlowBorderStyle}
        >
          {JUDGEMENT_CELLS.map((cell) => {
            const value = String(judgements[cell.key]);

            return (
              <SpoilerText
                as="div"
                className={[
                  "grid min-h-6 min-w-0 place-items-center leading-none",
                  cell.className,
                  getJudgementTextSize(value),
                ].join(" ")}
                key={cell.key}
                title={t(cell.labelKey)}
              >
                {value}
              </SpoilerText>
            );
          })}
        </div>
      </SpoilerSection>
    </section>
  );
}

function getJudgementTextSize(value: string): string {
  if (value.length >= 6) {
    return "text-[10px]";
  }

  if (value.length >= 5) {
    return "text-[11px]";
  }

  if (value.length >= 4) {
    return "text-xs";
  }

  return "text-sm";
}
