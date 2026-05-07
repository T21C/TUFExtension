import { X } from "lucide-react";
import { t } from "~/platform/chrome/i18n";

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      aria-label={t("drawerClose")}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-transparent text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      onClick={onClick}
      title={t("drawerCloseTitle")}
      type="button"
    >
      <X aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
