import { t } from "~/platform/chrome/i18n";

interface DrawerControlsToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function DrawerControlsToggleButton({
  isOpen,
  onClick,
}: DrawerControlsToggleButtonProps) {
  const label = isOpen
    ? t("drawerControlsCollapse")
    : t("drawerControlsExpand");

  return (
    <button
      aria-expanded={isOpen}
      aria-label={label}
      className={[
        "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors",
        isOpen
          ? "bg-violet-500/20 text-violet-100 shadow-[0_0_16px_rgba(168,85,247,0.28)]"
          : "bg-transparent text-white/60 hover:bg-white/10 hover:text-white",
      ].join(" ")}
      onClick={onClick}
      title={label}
      type="button"
    >
      <ControlsIcon isOpen={isOpen} />
    </button>
  );
}

function ControlsIcon({ isOpen }: { isOpen: boolean }) {
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
      <circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
