interface SpoilerToggleButtonProps {
  isDisabled: boolean;
  onClick: () => void;
}

export function SpoilerToggleButton({
  isDisabled,
  onClick,
}: SpoilerToggleButtonProps) {
  const label = isDisabled
    ? "Enable spoiler protection"
    : "Disable spoiler protection";

  return (
    <button
      aria-label={label}
      aria-pressed={isDisabled}
      className={[
        "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors",
        isDisabled
          ? "bg-violet-500/20 text-violet-100 shadow-[0_0_16px_rgba(168,85,247,0.34)]"
          : "bg-transparent text-white/60 hover:bg-white/10 hover:text-white",
      ].join(" ")}
      onClick={onClick}
      title={label}
      type="button"
    >
      {isDisabled ? <EyeIcon /> : <EyeSlashIcon />}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="M2.28 10.75C3.38 9.12 6.75 5 12 5s8.62 4.12 9.72 5.75c.37.55.37 1.95 0 2.5C20.62 14.88 17.25 19 12 19s-8.62-4.12-9.72-5.75c-.37-.55-.37-1.95 0-2.5Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="M3 3L21 21" />
      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
      <path d="M9.18 5.47A9.8 9.8 0 0 1 12 5c5.25 0 8.62 4.12 9.72 5.75.37.55.37 1.95 0 2.5a15.9 15.9 0 0 1-2.1 2.43M6.34 6.86a16.18 16.18 0 0 0-4.06 3.89c-.37.55-.37 1.95 0 2.5C3.38 14.88 6.75 19 12 19c1.55 0 2.92-.36 4.1-.9" />
    </svg>
  );
}
