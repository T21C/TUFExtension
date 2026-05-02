import type { ReactNode } from "react";
import {
  DownloadIcon,
  HeartIcon,
  SteamIcon,
  TufIcon,
} from "~/drawer/shared/level-icons";
import type { LevelPageData } from "~/domain/tuf/types";
import type { LevelLikeController } from "~/features/drawer/use-level-like";
import { t } from "~/platform/chrome/i18n";
import {
  interactiveSurfaceClassName,
  mutedSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";

export function LevelActionStrip({
  data,
  likeController,
}: {
  data: LevelPageData;
  likeController: LevelLikeController;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <ActionLink href={data.levelUrl} label={t("openInTuf")}>
        <TufIcon size={24} />
      </ActionLink>
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
      <button
        aria-label={getLikeButtonLabel(likeController)}
        className={[
          "grid h-12 place-items-center",
          likeController.liked
            ? "rounded-md border bg-black/35 text-[#ff2222] shadow-[0_0_18px_rgba(255,34,34,0.18)] backdrop-blur-md transition"
            : interactiveSurfaceClassName,
          likeController.isLoading || likeController.isPending
            ? "cursor-wait opacity-70"
            : "cursor-pointer",
        ].join(" ")}
        disabled={likeController.isLoading || likeController.isPending}
        onClick={likeController.onToggleLike}
        title={getLikeButtonLabel(likeController)}
        type="button"
      >
        <HeartIcon filled={likeController.liked} size={21} />
      </button>
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

function getLikeButtonLabel(likeController: LevelLikeController): string {
  if (likeController.isLoading) {
    return t("checkingTufLogin");
  }

  if (likeController.isPending) {
    return t("updatingLike");
  }

  if (likeController.authStatus === "unauthenticated") {
    return t("loginToLikeLevel");
  }

  if (likeController.authStatus === "error") {
    return likeController.error ?? t("couldNotCheckTufLogin");
  }

  return likeController.liked ? t("unlikeLevel") : t("likeLevel");
}
