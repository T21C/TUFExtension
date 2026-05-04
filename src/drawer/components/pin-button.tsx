import { Pin, PinOff } from "lucide-react";
import { t } from "~/platform/chrome/i18n";

interface PinButtonProps {
  isPinned: boolean;
  onClick: () => void;
}

export function PinButton({ isPinned, onClick }: PinButtonProps) {
  return (
    <button
      aria-label={isPinned ? t("drawerUnpin") : t("drawerPin")}
      aria-pressed={isPinned}
      className={[
        "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors",
        isPinned
          ? "bg-violet-500/20 text-violet-100 shadow-[0_0_16px_rgba(168,85,247,0.34)]"
          : "bg-transparent text-white/60 hover:bg-white/10 hover:text-white",
      ].join(" ")}
      onClick={onClick}
      title={isPinned ? t("drawerUnpinTitle") : t("drawerPinTitle")}
      type="button"
    >
      {isPinned ? (
        <PinOff aria-hidden="true" className="h-4 w-4" fill="currentColor" />
      ) : (
        <Pin aria-hidden="true" className="h-4 w-4" />
      )}
    </button>
  );
}
