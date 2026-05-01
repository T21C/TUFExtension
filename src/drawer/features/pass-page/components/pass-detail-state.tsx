import { panelSurfaceClassName } from "@drawer/shared/level-surface";

export function PassDetailSkeleton() {
  return (
    <article className="space-y-2.5 pb-4 text-white">
      <div className={`${panelSurfaceClassName} h-52 animate-pulse`} />
      <div className={`${panelSurfaceClassName} h-28 animate-pulse`} />
      <div className={`${panelSurfaceClassName} h-40 animate-pulse`} />
    </article>
  );
}

export function PassDetailError({
  message,
  onRetry
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <article className="pb-4 text-white">
      <section className={`${panelSurfaceClassName} p-4`}>
        <p className="text-sm font-black uppercase tracking-[0.08em] text-white/45">
          Pass data unavailable
        </p>
        <p className="mt-2 text-sm text-white/75">
          {message ?? "Failed to load pass data."}
        </p>
        <button
          className="mt-4 rounded-md border border-white/10 bg-black/35 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-black/20"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </section>
    </article>
  );
}
