export function LevelDetailSkeleton() {
  return (
    <div className="space-y-4 pb-5">
      <div className="h-[280px] animate-pulse rounded-md bg-white/10" />
      <div className="h-40 animate-pulse rounded-md bg-white/10" />
      <div className="h-52 animate-pulse rounded-md bg-white/10" />
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
      <div>
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
