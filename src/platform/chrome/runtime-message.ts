import { logDebug, logWarn } from "@platform/content-script/logger";
import type {
  LevelAuthState,
  LevelPageData,
  ResolvedLevelContext
} from "@domain/tuf/types";
import type { VideoReference } from "@domain/video/types";
import {
  isExtensionContextAvailable,
  isExtensionContextInvalidatedError
} from "./extension-context";

export interface ResolveVideoRequest {
  type: "RESOLVE_VIDEO";
  video: VideoReference;
}

export interface ResolveVideoResult {
  type: "RESOLVE_VIDEO_RESULT";
  level: ResolvedLevelContext | null;
  levels: ResolvedLevelContext[];
}

export interface GetLevelPageDataRequest {
  type: "GET_LEVEL_PAGE_DATA";
  levelId: string;
}

export interface GetLevelPageDataResult {
  type: "GET_LEVEL_PAGE_DATA_RESULT";
  data?: LevelPageData;
  error?: string;
  levelId: string;
}

export interface GetLevelAuthStateRequest {
  type: "GET_LEVEL_AUTH_STATE";
  levelId: string;
}

export interface GetLevelAuthStateResult {
  type: "GET_LEVEL_AUTH_STATE_RESULT";
  error?: string;
  levelId: string;
  state?: LevelAuthState;
}

export interface SetLevelLikeRequest {
  type: "SET_LEVEL_LIKE";
  levelId: string;
  liked: boolean;
}

export interface SetLevelLikeResult {
  type: "SET_LEVEL_LIKE_RESULT";
  error?: string;
  levelId: string;
  liked?: boolean;
  likes?: number;
}

export interface OpenTufLoginRequest {
  type: "OPEN_TUF_LOGIN";
}

export interface OpenTufLoginResult {
  type: "OPEN_TUF_LOGIN_RESULT";
  opened: boolean;
}

export type ExtensionRequest =
  | GetLevelAuthStateRequest
  | GetLevelPageDataRequest
  | OpenTufLoginRequest
  | ResolveVideoRequest
  | SetLevelLikeRequest;

export type ExtensionResponse =
  | GetLevelAuthStateResult
  | GetLevelPageDataResult
  | OpenTufLoginResult
  | ResolveVideoResult
  | SetLevelLikeResult;

export function sendRuntimeMessage<TResponse>(
  message: ExtensionRequest
): Promise<TResponse | undefined> {
  logDebug("Sending runtime message", message);

  if (!isExtensionContextAvailable()) {
    logWarn("Runtime message skipped because extension context is unavailable", {
      message
    });
    return Promise.resolve(undefined);
  }

  try {
    return chrome.runtime.sendMessage(message).catch((error: unknown) => {
      if (isExtensionContextInvalidatedError(error)) {
        logWarn("Runtime message skipped after extension context invalidation", {
          message
        });
        return undefined;
      }

      logWarn("Runtime message failed", { message, error });
      return undefined;
    });
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) {
      logWarn("Runtime message skipped after extension context invalidation", {
        message
      });
      return Promise.resolve(undefined);
    }

    return Promise.reject(error);
  }
}
