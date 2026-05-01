interface PinButtonProps {
  isPinned: boolean;
  onClick: () => void;
}

export function PinButton({ isPinned, onClick }: PinButtonProps) {
  return (
    <button
      aria-label={isPinned ? "Unpin TUF drawer" : "Pin TUF drawer"}
      aria-pressed={isPinned}
      className={[
        "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors",
        isPinned
          ? "bg-violet-500/20 text-violet-100 shadow-[0_0_16px_rgba(168,85,247,0.34)]"
          : "bg-transparent text-white/60 hover:bg-white/10 hover:text-white"
      ].join(" ")}
      onClick={onClick}
      title={isPinned ? "Unpin drawer" : "Pin drawer"}
      type="button"
    >
      <PinIcon isPinned={isPinned} />
    </button>
  );
}

function PinIcon({ isPinned }: { isPinned: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill={isPinned ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="M14.5 3.5 20.5 9.5" />
      <path d="M8 10.5 13.5 5 19 10.5 15.5 14 16.5 19 15.25 20.25 11 16 6.5 20.5 5.5 19.5 10 15 5.75 10.75 7 9.5 12 10.5" />
    </svg>
  );
}
