import type { ReactNode } from "react";
import { DownloadIcon, SteamIcon, TufIcon } from "~/drawer/shared/level-icons";
import type { LevelPageData } from "~/domain/tuf/types";
import { t } from "~/platform/chrome/i18n";
import { WebAdofaiViewerAction } from "~/drawer/shared/web-adofai-viewer";
import {
  interactiveSurfaceClassName,
  mutedSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";

export function LevelActionStrip({ data }: { data: LevelPageData }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <ActionLink href={data.levelUrl} label={t("openInTuf")}>
        <TufIcon size={24} />
      </ActionLink>
      <WebAdofaiViewerAction levelId={data.level.id} />
      {data.level.downloadLink ? (
        <ActionLink href={data.level.downloadLink} label={t("download")}>
          <DownloadIcon size={22} />
        </ActionLink>
      ) : (
        <DisabledAction label={t("downloadUnavailable")}>
          <DownloadIcon size={22} />
        </DisabledAction>
      )}
      {data.level.workshopLink ? (
        <ActionLink href={data.level.workshopLink} label={t("openWorkshop")}>
          <SteamIcon size={22} />
        </ActionLink>
      ) : (
        <DisabledAction label={t("workshopUnavailable")}>
          <SteamIcon size={22} />
        </DisabledAction>
      )}
    </div>
  );
}

function ActionLink({
  children,
  href,
  label,
}: {
  children: ReactNode;
  href: string;
  label: string;
}) {
  return (
    <a
      aria-label={label}
      className={[
        "grid h-12 place-items-center",
        interactiveSurfaceClassName,
      ].join(" ")}
      href={href}
      rel="noreferrer"
      style={softGlowBorderStyle}
      target="_blank"
      title={label}
    >
      {children}
    </a>
  );
}

function DisabledAction({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className={[
        "grid h-12 cursor-not-allowed place-items-center",
        mutedSurfaceClassName,
      ].join(" ")}
      disabled
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
