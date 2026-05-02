import { logDebug, logError, logInfo } from "~/shared/logger";
import {
  getLevelAuthState,
  getLevelPageData,
  getPassPageData,
  resolveLevelByVideoUrl,
  resolvePassesByVideoUrl,
  setLevelLiked,
} from "~/domain/tuf/tuf-api";
import type {
  ExtensionRequest,
  ExtensionResponse,
} from "~/platform/chrome/runtime-message";
import type {
  ResolvedLevelContext,
  ResolvedPassContext,
} from "~/domain/tuf/types";
import type { VideoReference } from "~/domain/video/types";

export default defineBackground({
  type: "module",
  main: () => {
    chrome.runtime.onInstalled.addListener(() => {
      logInfo("Extension installed");
    });

    logInfo("Background service worker loaded");

    chrome.runtime.onMessage.addListener(
      (
        message: ExtensionRequest,
        sender,
        sendResponse: (response?: ExtensionResponse) => void,
      ) => {
        logDebug("Received runtime message", {
          type: message.type,
          tabId: sender.tab?.id,
          url: sender.tab?.url,
        });

        if (message.type === "RESOLVE_VIDEO") {
          void handleResolveVideo(message.video)
            .then(({ levels, passes }) => {
              const level = levels[0] ?? null;
              const items = [...passes, ...levels];

              logInfo("Sending TUF video resolution result", {
                matched: items.length > 0,
                itemCount: items.length,
                levelIds: levels.map((item) => item.levelId),
                passIds: passes.map((item) => item.passId),
              });
              sendResponse({
                type: "RESOLVE_VIDEO_RESULT",
                items,
                level,
                levels,
                passes,
              });
            })
            .catch((error: unknown) => {
              logError("Failed to resolve video", error);
              sendResponse({
                type: "RESOLVE_VIDEO_RESULT",
                items: [],
                level: null,
                levels: [],
                passes: [],
              });
            });

          return true;
        }

        if (message.type === "GET_LEVEL_PAGE_DATA") {
          void getLevelPageData(message.levelId)
            .then((data) => {
              logInfo("Sending level page data result", {
                levelId: message.levelId,
                passCount: data.passes.length,
              });
              sendResponse({
                type: "GET_LEVEL_PAGE_DATA_RESULT",
                data,
                levelId: message.levelId,
              });
            })
            .catch((error: unknown) => {
              logError("Failed to load level page data", error);
              sendResponse({
                type: "GET_LEVEL_PAGE_DATA_RESULT",
                error: error instanceof Error ? error.message : String(error),
                levelId: message.levelId,
              });
            });

          return true;
        }

        if (message.type === "GET_PASS_PAGE_DATA") {
          void getPassPageData(message.passId)
            .then((data) => {
              logInfo("Sending pass page data result", {
                passId: message.passId,
                player: data.pass.player.name,
              });
              sendResponse({
                type: "GET_PASS_PAGE_DATA_RESULT",
                data,
                passId: message.passId,
              });
            })
            .catch((error: unknown) => {
              logError("Failed to load pass page data", error);
              sendResponse({
                type: "GET_PASS_PAGE_DATA_RESULT",
                error: error instanceof Error ? error.message : String(error),
                passId: message.passId,
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
                liked: state.liked,
              });
              sendResponse({
                type: "GET_LEVEL_AUTH_STATE_RESULT",
                levelId: message.levelId,
                state,
              });
            })
            .catch((error: unknown) => {
              logError("Failed to load TUF level auth state", error);
              sendResponse({
                type: "GET_LEVEL_AUTH_STATE_RESULT",
                error: error instanceof Error ? error.message : String(error),
                levelId: message.levelId,
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
                likes: result.likes,
              });
              sendResponse({
                type: "SET_LEVEL_LIKE_RESULT",
                levelId: message.levelId,
                liked: result.liked,
                likes: result.likes,
              });
            })
            .catch((error: unknown) => {
              logError("Failed to set TUF level like", error);
              sendResponse({
                type: "SET_LEVEL_LIKE_RESULT",
                error: error instanceof Error ? error.message : String(error),
                levelId: message.levelId,
              });
            });

          return true;
        }

        if (message.type === "OPEN_TUF_LOGIN") {
          void chrome.tabs.create({ url: "https://tuforums.com/login" });
          sendResponse({
            type: "OPEN_TUF_LOGIN_RESULT",
            opened: true,
          });
          return false;
        }

        return false;
      },
    );

    async function handleResolveVideo(video: VideoReference): Promise<{
      levels: ResolvedLevelContext[];
      passes: ResolvedPassContext[];
    }> {
      logInfo("Resolving video via TUF API", video);
      const [levels, passes] = await Promise.all([
        resolveLevelByVideoUrl(video),
        resolvePassesByVideoUrl(video),
      ]);
      logInfo("Resolved current video context", {
        matched: levels.length + passes.length > 0,
        levelCount: levels.length,
        levelIds: levels.map((level) => level.levelId),
        passCount: passes.length,
        passIds: passes.map((pass) => pass.passId),
      });
      return { levels, passes };
    }
  },
});
