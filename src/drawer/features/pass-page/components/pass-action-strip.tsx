import type { ReactNode } from "react";
import type { PassPageData } from "~/domain/tuf/types";
import { TufIcon } from "~/drawer/shared/level-icons";
import { interactiveSurfaceClassName } from "~/drawer/shared/level-surface";

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
      label: "Open Pass in TUF",
    },
    data.pass.level.id
      ? {
          href: `https://tuforums.com/levels/${data.pass.level.id}`,
          icon: <TufIcon size={22} />,
          label: "Open Level",
        }
      : null,
  ];
  const actions = candidates.filter(isPassAction);
  const spoilerLabel = areSpoilersRevealed
    ? "Hide all pass spoilers"
    : "Reveal all pass spoilers";
  const effectiveSpoilerLabel = isSpoilerProtectionDisabled
    ? "Spoiler protection is disabled"
    : spoilerLabel;

  return (
    <div className="grid grid-cols-3 gap-2">
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
        {areSpoilersRevealed ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
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

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M2.28 10.75C3.38 9.12 6.75 5 12 5s8.62 4.12 9.72 5.75c.37.55.37 1.95 0 2.5C20.62 14.88 17.25 19 12 19s-8.62-4.12-9.72-5.75c-.37-.55-.37-1.95 0-2.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M9.18 5.47A9.8 9.8 0 0 1 12 5c5.25 0 8.62 4.12 9.72 5.75.37.55.37 1.95 0 2.5a15.9 15.9 0 0 1-2.1 2.43M6.34 6.86a16.18 16.18 0 0 0-4.06 3.89c-.37.55-.37 1.95 0 2.5C3.38 14.88 6.75 19 12 19c1.55 0 2.92-.36 4.1-.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PassIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 4.5h9.2L19 9.3v10.2H5V4.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.2 4.7V9.3H19"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.2 14.1 10.6 16.5 16 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
      />
    </svg>
  );
}
