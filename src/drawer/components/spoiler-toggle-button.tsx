import { Eye, EyeOff } from "lucide-react";
import { t } from "~/platform/chrome/i18n";

interface SpoilerToggleButtonProps {
  isDisabled: boolean;
  onClick: () => void;
}

export function SpoilerToggleButton({
  isDisabled,
  onClick,
}: SpoilerToggleButtonProps) {
  const label = isDisabled
    ? t("spoilerProtectionEnable")
    : t("spoilerProtectionDisable");

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
      {isDisabled ? (
        <Eye aria-hidden="true" className="h-4 w-4" />
      ) : (
        <EyeOff aria-hidden="true" className="h-4 w-4" />
      )}
    </button>
  );
}
