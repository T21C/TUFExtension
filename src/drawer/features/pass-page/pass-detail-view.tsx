import { useState } from "react";
import type { PassPageData, PassPageLoadState } from "~/domain/tuf/types";
import { PassActionStrip } from "./components/pass-action-strip";
import {
  PassDetailError,
  PassDetailSkeleton,
} from "./components/pass-detail-state";
import { PassHero } from "./components/pass-hero";
import { PassJudgementsPanel } from "./components/pass-judgements-panel";
import { PassPlayerCard } from "./components/pass-player-card";
import { SpoilerControlsProvider } from "./components/spoiler-text";
import { t } from "~/platform/chrome/i18n";

interface PassDetailViewProps {
  isSpoilerProtectionDisabled: boolean;
  state: PassPageLoadState;
  onRetry: () => void;
}

export function PassDetailView({
  isSpoilerProtectionDisabled,
  onRetry,
  state,
}: PassDetailViewProps) {
  if (state.isLoading && !state.data) {
    return <PassDetailSkeleton />;
  }

  if (!state.data) {
    return <PassDetailError message={state.error} onRetry={onRetry} />;
  }

  return (
    <LoadedPassDetail
      data={state.data}
      isSpoilerProtectionDisabled={isSpoilerProtectionDisabled}
    />
  );
}

function LoadedPassDetail({
  data,
  isSpoilerProtectionDisabled,
}: {
  data: PassPageData;
  isSpoilerProtectionDisabled: boolean;
}) {
  const [hideAllVersion, setHideAllVersion] = useState(0);
  const [revealAllVersion, setRevealAllVersion] = useState(0);
  const [areSpoilersRevealed, setAreSpoilersRevealed] = useState(false);

  function toggleSpoilers() {
    if (areSpoilersRevealed) {
      setAreSpoilersRevealed(false);
      setHideAllVersion((value) => value + 1);
      return;
    }

    setAreSpoilersRevealed(true);
    setRevealAllVersion((value) => value + 1);
  }

  return (
    <SpoilerControlsProvider
      hideAllVersion={hideAllVersion}
      isProtectionDisabled={isSpoilerProtectionDisabled}
      revealAllVersion={revealAllVersion}
    >
      <article className="space-y-2.5 pb-4 pt-2 text-white">
        {data.pass.isDeleted ? (
          <PassStatusBanner text={t("passDeleted")} />
        ) : data.pass.isHidden ? (
          <PassStatusBanner text={t("passHidden")} />
        ) : null}
        <PassHero data={data} />
        <PassActionStrip
          areSpoilersRevealed={areSpoilersRevealed}
          data={data}
          isSpoilerProtectionDisabled={isSpoilerProtectionDisabled}
          onToggleSpoilers={toggleSpoilers}
        />
        <PassPlayerCard pass={data.pass} />
        <PassJudgementsPanel judgements={data.pass.judgements} />
      </article>
    </SpoilerControlsProvider>
  );
}

function PassStatusBanner({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-red-300/25 bg-red-950/35 px-3 py-2 text-sm font-bold text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.16)]">
      {text}
    </div>
  );
}
