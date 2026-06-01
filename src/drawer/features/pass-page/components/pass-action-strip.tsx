import type { ReactNode } from "react";
import { Eye, EyeOff, FileCheck } from "lucide-react";
import type { PassPageData } from "~/domain/tuf/types";
import { TufIcon } from "~/drawer/shared/level-icons";
import { interactiveSurfaceClassName } from "~/drawer/shared/level-surface";
import { WebAdofaiViewerAction } from "~/drawer/shared/web-adofai-viewer";
import { t } from "~/platform/chrome/i18n";

interface PassAction {
  href: string;
  icon: ReactNode;
  label: string;
}

export function PassActionStrip({
  areSpoilersRevealed,
  data,
  isSpoilerProtectionDisabled,
  onToggleSpoilers,
}: {
  areSpoilersRevealed: boolean;
  data: PassPageData;
  isSpoilerProtectionDisabled: boolean;
  onToggleSpoilers: () => void;
}) {
  const candidates: Array<PassAction | null> = [
    {
      href: data.passUrl,
      icon: <PassIcon />,
      label: t("openPassInTuf"),
    },
    data.pass.level.id
      ? {
          href: `https://tuforums.com/levels/${data.pass.level.id}`,
          icon: <TufIcon size={22} />,
          label: t("openLevel"),
        }
      : null,
  ];
  const actions = candidates.filter(isPassAction);
  const spoilerLabel = areSpoilersRevealed
    ? t("hideAllPassSpoilers")
    : t("revealAllPassSpoilers");
  const effectiveSpoilerLabel = isSpoilerProtectionDisabled
    ? t("spoilerProtectionDisabled")
    : spoilerLabel;

  return (
    <div className="grid grid-cols-4 gap-2">
      <button
        aria-pressed={areSpoilersRevealed}
        aria-label={effectiveSpoilerLabel}
        className={[
          interactiveSurfaceClassName,
          "grid h-11 place-items-center",
          isSpoilerProtectionDisabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
        disabled={isSpoilerProtectionDisabled}
        onClick={onToggleSpoilers}
        title={effectiveSpoilerLabel}
        type="button"
      >
        {areSpoilersRevealed ? (
          <EyeOff aria-hidden="true" className="h-6 w-6" />
        ) : (
          <Eye aria-hidden="true" className="h-6 w-6" />
        )}
      </button>
      <WebAdofaiViewerAction className="h-11" levelId={data.pass.level.id} />
      {actions.map((action) => (
        <a
          className={`${interactiveSurfaceClassName} grid h-11 place-items-center`}
          href={action.href}
          key={action.label}
          rel="noreferrer"
          target="_blank"
          title={action.label}
        >
          {action.icon}
          <span className="sr-only">{action.label}</span>
        </a>
      ))}
    </div>
  );
}

function isPassAction(value: PassAction | null): value is PassAction {
  return Boolean(value);
}

function PassIcon() {
  return <FileCheck aria-hidden="true" className="h-6 w-6" />;
}
