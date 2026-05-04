import type { ReactNode } from "react";
import type { LevelPassJudgements } from "~/domain/tuf/types";
import { softGlowBorderStyle } from "~/drawer/shared/level-surface";
import { t } from "~/platform/chrome/i18n";

const JUDGEMENT_CELLS = [
  { key: "earlyDouble", className: "text-red-500", labelKey: "tooEarly" },
  { key: "earlySingle", className: "text-orange-400", labelKey: "early" },
  { key: "ePerfect", className: "text-yellow-300", labelKey: "ePerfect" },
  { key: "perfect", className: "text-lime-300", labelKey: "perfect" },
  { key: "lPerfect", className: "text-yellow-300", labelKey: "lPerfect" },
  { key: "lateSingle", className: "text-orange-400", labelKey: "late" },
  { key: "lateDouble", className: "text-red-500", labelKey: "tooLate" },
] as const;

interface JudgementStripProps {
  judgements: LevelPassJudgements;
  renderValue?: (props: {
    cellClassName: string;
    label: string;
    value: string;
  }) => ReactNode;
}

export function JudgementStrip({
  judgements,
  renderValue,
}: JudgementStripProps) {
  return (
    <div
      className="grid min-h-9 grid-cols-7 items-center rounded border bg-black/35 px-1 py-1 text-md font-medium tabular-nums backdrop-blur-md"
      style={softGlowBorderStyle}
    >
      {JUDGEMENT_CELLS.map((cell) => {
        const value = String(judgements[cell.key]);
        const label = t(cell.labelKey);
        const cellClassName = [
          "grid min-h-6 min-w-0 place-items-center leading-none",
          cell.className,
          getJudgementTextSize(value),
        ].join(" ");

        return (
          <div className="grid min-w-0 place-items-center" key={cell.key}>
            {renderValue ? (
              renderValue({ cellClassName, label, value })
            ) : (
              <span className={cellClassName} title={label}>
                {value}
              </span>
            )}
          </div>
        );
      })}
    </div>
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
