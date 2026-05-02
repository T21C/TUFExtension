import {
  clearDrawer,
  mountOrUpdateDrawer,
  toggleDrawer,
} from "~/drawer/drawer-controller";
import { getVideoReference } from "~/domain/video/video-reference";
import {
  injectTufButton,
  removeTufButton,
} from "~/features/tuf-button/inject-tuf-button";
import { isExtensionContextInvalidatedError } from "~/platform/chrome/extension-context";
import {
  sendRuntimeMessage,
  type ResolveVideoResult,
} from "~/platform/chrome/runtime-message";
import { watchUrlChanges } from "~/platform/content-script/url-watcher";
import { logDebug, logInfo, logWarn } from "~/platform/content-script/logger";
import type { ResolvedTufContext } from "~/domain/tuf/types";
import type { VideoReference } from "~/domain/video/types";

export default defineContentScript({
  matches: ["https://www.youtube.com/*", "https://www.bilibili.com/*"],
  main: () => {
    let lastCanonicalUrl: string | null = null;
    let activeVideo: VideoReference | null = null;
    let activeItems: ResolvedTufContext[] = [];

    logInfo("Content script loaded", { href: window.location.href });
    scheduleResolveCurrentVideo();
    watchUrlChanges(scheduleResolveCurrentVideo);

    function scheduleResolveCurrentVideo(): void {
      void resolveCurrentVideo().catch((error: unknown) => {
        if (isExtensionContextInvalidatedError(error)) {
          logWarn(
            "Extension context was invalidated; reload this tab after reloading the extension.",
          );
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
            href: window.location.href,
          });
        } else {
          logDebug("No supported video detected", {
            href: window.location.href,
          });
        }

        lastCanonicalUrl = null;
        activeVideo = null;
        activeItems = [];
        removeTufButton();
        clearDrawer();
        return;
      }

      if (video.canonicalUrl === lastCanonicalUrl) {
        if (activeItems.length > 0) {
          logDebug("Remounting TUF button for unchanged video", {
            itemKeys: activeItems.map((item) => item.itemKey),
            video,
          });
          injectTufButton(activeItems[0], toggleActiveDrawer);
          mountOrUpdateDrawer(activeItems);
          return;
        }

        logDebug("Skipping unchanged video without active TUF items", video);
        return;
      }

      logInfo("Detected supported video", video);
      lastCanonicalUrl = video.canonicalUrl;
      activeVideo = video;
      activeItems = [];
      removeTufButton();
      clearDrawer();

      logInfo("Requesting TUF video resolution", video);
      const response = await sendRuntimeMessage<ResolveVideoResult>({
        type: "RESOLVE_VIDEO",
        video,
      });

      logInfo("Received TUF video resolution response", response);

      const items = getResolvedItems(response);

      if (
        items.length > 0 &&
        activeVideo?.canonicalUrl === video.canonicalUrl
      ) {
        activeItems = items;
        injectTufButton(items[0], toggleActiveDrawer);
        mountOrUpdateDrawer(items);
        return;
      }

      if (items.length === 0) {
        logInfo("No TUF result matched for current video", video);
        activeItems = [];
        clearDrawer();
      }
    }

    function toggleActiveDrawer(): void {
      if (activeItems.length === 0) {
        logWarn(
          "TUF button clicked without an active TUF context",
          activeVideo,
        );
        return;
      }

      logInfo("TUF button clicked; toggling injected drawer", {
        video: activeVideo,
        count: activeItems.length,
        itemKeys: activeItems.map((item) => item.itemKey),
      });
      toggleDrawer(activeItems);
    }

    function getResolvedItems(
      response: ResolveVideoResult | undefined,
    ): ResolvedTufContext[] {
      if (!response) {
        return [];
      }

      if (Array.isArray(response.items)) {
        return response.items;
      }

      const passes = Array.isArray(response.passes) ? response.passes : [];
      if (Array.isArray(response.levels)) {
        return [...passes, ...response.levels];
      }

      return response.level ? [...passes, response.level] : passes;
    }
  },
  runAt: "document_idle",
});
