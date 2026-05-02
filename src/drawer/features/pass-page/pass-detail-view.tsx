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
import { PassStatsPanel } from "./components/pass-stats-panel";
import { SpoilerControlsProvider } from "./components/spoiler-text";

interface PassDetailViewProps {
  state: PassPageLoadState;
  onRetry: () => void;
}

export function PassDetailView({ onRetry, state }: PassDetailViewProps) {
  if (state.isLoading && !state.data) {
    return <PassDetailSkeleton />;
  }

  if (!state.data) {
    return <PassDetailError message={state.error} onRetry={onRetry} />;
  }

  return <LoadedPassDetail data={state.data} />;
}

function LoadedPassDetail({ data }: { data: PassPageData }) {
  const [hideAllVersion, setHideAllVersion] = useState(0);
  const [revealAllVersion, setRevealAllVersion] = useState(0);

  return (
    <SpoilerControlsProvider
      hideAllVersion={hideAllVersion}
      revealAllVersion={revealAllVersion}
    >
      <article className="space-y-2.5 pb-4 pt-2 text-white">
        {data.pass.isDeleted ? (
          <PassStatusBanner text="This pass has been deleted." />
        ) : data.pass.isHidden ? (
          <PassStatusBanner text="This pass is hidden." />
        ) : null}
        <PassHero data={data} />
        <PassActionStrip
          data={data}
          onHideSpoilers={() => setHideAllVersion((value) => value + 1)}
          onRevealSpoilers={() => setRevealAllVersion((value) => value + 1)}
        />
        <PassPlayerCard pass={data.pass} />
        <PassStatsPanel pass={data.pass} />
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
