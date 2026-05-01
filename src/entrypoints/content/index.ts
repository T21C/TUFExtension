import { clearDrawer, mountOrUpdateDrawer, toggleDrawer } from "@drawer/drawer-controller";
import { getVideoReference } from "@domain/video/video-reference";
import { injectTufButton, removeTufButton } from "@features/tuf-button/inject-tuf-button";
import { isExtensionContextInvalidatedError } from "@platform/chrome/extension-context";
import {
  sendRuntimeMessage,
  type ResolveVideoResult
} from "@platform/chrome/runtime-message";
import { watchUrlChanges } from "@platform/content-script/url-watcher";
import { logDebug, logInfo, logWarn } from "@platform/content-script/logger";
import type { ResolvedLevelContext } from "@domain/tuf/types";
import type { VideoReference } from "@domain/video/types";

let lastCanonicalUrl: string | null = null;
let activeVideo: VideoReference | null = null;
let activeLevels: ResolvedLevelContext[] = [];

logInfo("Content script loaded", { href: window.location.href });
scheduleResolveCurrentVideo();
watchUrlChanges(scheduleResolveCurrentVideo);

function scheduleResolveCurrentVideo(): void {
  void resolveCurrentVideo().catch((error: unknown) => {
    if (isExtensionContextInvalidatedError(error)) {
      logWarn("Extension context was invalidated; reload this tab after reloading the extension.");
      return;
    }

    logWarn("Failed to resolve current video", error);
  });
}

async function resolveCurrentVideo(): Promise<void> {
  const video = getVideoReference();

  if (!video) {
    if (lastCanonicalUrl !== null) {
      logInfo("No supported video detected; clearing active state", {
        href: window.location.href
      });
    } else {
      logDebug("No supported video detected", { href: window.location.href });
    }

    lastCanonicalUrl = null;
    activeVideo = null;
    activeLevels = [];
    removeTufButton();
    clearDrawer();
    return;
  }

  if (video.canonicalUrl === lastCanonicalUrl) {
    logDebug("Skipping unchanged video", video);
    return;
  }

  logInfo("Detected supported video", video);
  lastCanonicalUrl = video.canonicalUrl;
  activeVideo = video;
  activeLevels = [];
  removeTufButton();
  clearDrawer();

  logInfo("Requesting level resolution", video);
  const response = await sendRuntimeMessage<ResolveVideoResult>({
    type: "RESOLVE_VIDEO",
    video
  });

  logInfo("Received level resolution response", response);

  const levels = getResolvedLevels(response);

  if (levels.length > 0 && activeVideo?.canonicalUrl === video.canonicalUrl) {
    activeLevels = levels;
    injectTufButton(levels[0], toggleActiveDrawer);
    mountOrUpdateDrawer(levels);
    return;
  }

  if (levels.length === 0) {
    logInfo("No TUF level matched for current video", video);
    activeLevels = [];
    clearDrawer();
  }
}

function toggleActiveDrawer(): void {
  if (activeLevels.length === 0) {
    logWarn("TUF button clicked without an active level context", activeVideo);
    return;
  }

  logInfo("TUF button clicked; toggling injected drawer", {
    video: activeVideo,
    count: activeLevels.length,
    levelIds: activeLevels.map((level) => level.levelId)
  });
  toggleDrawer(activeLevels);
}

function getResolvedLevels(response: ResolveVideoResult | undefined): ResolvedLevelContext[] {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.levels)) {
    return response.levels;
  }

  return response.level ? [response.level] : [];
}
