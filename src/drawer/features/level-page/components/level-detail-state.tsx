import {
  glowDividerStyle,
  panelSurfaceClassName,
} from "@drawer/shared/level-surface";

export function LevelDetailSkeleton() {
  return (
    <div className="space-y-4 pb-5">
      <div className={["h-[280px] animate-pulse", panelSurfaceClassName].join(" ")} />
      <div className={["h-40 animate-pulse", panelSurfaceClassName].join(" ")} />
      <div className={["h-52 animate-pulse", panelSurfaceClassName].join(" ")} />
    </div>
  );
}

export function LevelDetailError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid h-full min-h-[360px] place-items-center px-6 text-center">
      <div className={["max-w-sm p-5", panelSurfaceClassName].join(" ")}>
        <div aria-hidden="true" className="mb-4 h-px" style={glowDividerStyle} />
        <h2 className="text-2xl font-extrabold">Could not load level</h2>
        <p className="mt-2 text-sm font-medium text-white/60">
          {message ?? "The TUF API did not return a readable response."}
        </p>
        <button
          className="mt-5 rounded bg-[#5339b2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#674ce0]"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
