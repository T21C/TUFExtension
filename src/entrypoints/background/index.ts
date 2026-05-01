import { logDebug, logError, logInfo } from "@shared/logger";
import {
  getLevelAuthState,
  getLevelPageData,
  resolveLevelByVideoUrl,
  setLevelLiked
} from "@domain/tuf/tuf-api";
import type {
  ExtensionRequest,
  ExtensionResponse,
} from "@platform/chrome/runtime-message";
import type { ResolvedLevelContext } from "@domain/tuf/types";
import type { VideoReference } from "@domain/video/types";

chrome.runtime.onInstalled.addListener(() => {
  logInfo("Extension installed");
});

logInfo("Background service worker loaded");

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionRequest,
    sender,
    sendResponse: (response?: ExtensionResponse) => void
  ) => {
    logDebug("Received runtime message", {
      type: message.type,
      tabId: sender.tab?.id,
      url: sender.tab?.url
    });

    if (message.type === "RESOLVE_VIDEO") {
      void handleResolveVideo(message.video)
        .then((levels) => {
          const level = levels[0] ?? null;

          logInfo("Sending level resolution result", {
            matched: levels.length > 0,
            count: levels.length,
            levelIds: levels.map((item) => item.levelId)
          });
          sendResponse({ type: "RESOLVE_VIDEO_RESULT", level, levels });
        })
        .catch((error: unknown) => {
          logError("Failed to resolve video", error);
          sendResponse({ type: "RESOLVE_VIDEO_RESULT", level: null, levels: [] });
        });

      return true;
    }

    if (message.type === "GET_LEVEL_PAGE_DATA") {
      void getLevelPageData(message.levelId)
        .then((data) => {
          logInfo("Sending level page data result", {
            levelId: message.levelId,
            passCount: data.passes.length
          });
          sendResponse({
            type: "GET_LEVEL_PAGE_DATA_RESULT",
            data,
            levelId: message.levelId
          });
        })
        .catch((error: unknown) => {
          logError("Failed to load level page data", error);
          sendResponse({
            type: "GET_LEVEL_PAGE_DATA_RESULT",
            error: error instanceof Error ? error.message : String(error),
            levelId: message.levelId
          });
        });

      return true;
    }

    if (message.type === "GET_LEVEL_AUTH_STATE") {
      void getLevelAuthState(message.levelId)
        .then((state) => {
          logInfo("Sending TUF level auth state", {
            authStatus: state.authStatus,
            levelId: message.levelId,
            liked: state.liked
          });
          sendResponse({
            type: "GET_LEVEL_AUTH_STATE_RESULT",
            levelId: message.levelId,
            state
          });
        })
        .catch((error: unknown) => {
          logError("Failed to load TUF level auth state", error);
          sendResponse({
            type: "GET_LEVEL_AUTH_STATE_RESULT",
            error: error instanceof Error ? error.message : String(error),
            levelId: message.levelId
          });
        });

      return true;
    }

    if (message.type === "SET_LEVEL_LIKE") {
      void setLevelLiked(message.levelId, message.liked)
        .then((result) => {
          logInfo("Sending TUF level like result", {
            levelId: message.levelId,
            liked: result.liked,
            likes: result.likes
          });
          sendResponse({
            type: "SET_LEVEL_LIKE_RESULT",
            levelId: message.levelId,
            liked: result.liked,
            likes: result.likes
          });
        })
        .catch((error: unknown) => {
          logError("Failed to set TUF level like", error);
          sendResponse({
            type: "SET_LEVEL_LIKE_RESULT",
            error: error instanceof Error ? error.message : String(error),
            levelId: message.levelId
          });
        });

      return true;
    }

    if (message.type === "OPEN_TUF_LOGIN") {
      void chrome.tabs.create({ url: "https://tuforums.com/login" });
      sendResponse({
        type: "OPEN_TUF_LOGIN_RESULT",
        opened: true
      });
      return false;
    }

    return false;
  }
);

async function handleResolveVideo(
  video: VideoReference
): Promise<ResolvedLevelContext[]> {
  logInfo("Resolving video via TUF API", video);
  const levels = await resolveLevelByVideoUrl(video);
  logInfo("Resolved current video context", {
    matched: levels.length > 0,
    count: levels.length,
    levelIds: levels.map((level) => level.levelId)
  });
  return levels;
}
