import type { PassJudgements } from "~/domain/tuf/types";
import {
  glowDividerStyle,
  panelSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";
import { JudgementStrip } from "~/drawer/shared/judgement-strip";
import { t } from "~/platform/chrome/i18n";
import { SpoilerSection, SpoilerText } from "./spoiler-text";

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
        <SpoilerText as="div" title={t("judgements")} variant="block">
          <JudgementStrip judgements={judgements} />
        </SpoilerText>
      </SpoilerSection>
    </section>
  );
}
