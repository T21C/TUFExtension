import { useEffect, useMemo, useState } from "react";
import {
  sendRuntimeMessage,
  type GetLevelAuthStateResult,
  type OpenTufLoginResult,
  type SetLevelLikeResult
} from "@platform/chrome/runtime-message";
import type { AuthStatus, AuthUser } from "@domain/tuf/types";

let hasOpenedLoginTabForMissingSession = false;

interface UseLevelLikeParams {
  initialLikes: number;
  levelId: string;
}

export interface LevelLikeController {
  authStatus: AuthStatus | "loading";
  error?: string;
  isLoading: boolean;
  isPending: boolean;
  liked: boolean;
  likes: number;
  onOpenLogin: () => void;
  onToggleLike: () => void;
  user?: AuthUser;
}

export function useLevelLike({
  initialLikes,
  levelId
}: UseLevelLikeParams): LevelLikeController {
  const [authStatus, setAuthStatus] = useState<AuthStatus | "loading">("loading");
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [user, setUser] = useState<AuthUser | undefined>();

  useEffect(() => {
    let isCancelled = false;

    setAuthStatus("loading");
    setError(undefined);
    setIsPending(false);
    setLiked(false);
    setLikes(initialLikes);
    setUser(undefined);

    void sendRuntimeMessage<GetLevelAuthStateResult>({
      levelId,
      type: "GET_LEVEL_AUTH_STATE"
    }).then((response) => {
      if (isCancelled) {
        return;
      }

      if (!response?.state) {
        setAuthStatus("error");
        setError(response?.error ?? "Failed to load TUF login state.");
        return;
      }

      setAuthStatus(response.state.authStatus);
      setError(response.state.error);
      setLiked(response.state.liked);
      setLikes(response.state.likes ?? initialLikes);
      setUser(response.state.user);
    });

    return () => {
      isCancelled = true;
    };
  }, [initialLikes, levelId]);

  useEffect(() => {
    if (authStatus !== "unauthenticated" || hasOpenedLoginTabForMissingSession) {
      return;
    }

    hasOpenedLoginTabForMissingSession = true;
    void sendRuntimeMessage<OpenTufLoginResult>({
      type: "OPEN_TUF_LOGIN"
    });
  }, [authStatus]);

  return useMemo(
    () => ({
      authStatus,
      error,
      isLoading: authStatus === "loading",
      isPending,
      liked,
      likes,
      onOpenLogin: () => {
        void sendRuntimeMessage<OpenTufLoginResult>({
          type: "OPEN_TUF_LOGIN"
        });
      },
      onToggleLike: () => {
        if (authStatus === "unauthenticated") {
          void sendRuntimeMessage<OpenTufLoginResult>({
            type: "OPEN_TUF_LOGIN"
          });
          return;
        }

        if (authStatus !== "authenticated" || isPending) {
          return;
        }

        const nextLiked = !liked;
        setIsPending(true);
        setError(undefined);

        void sendRuntimeMessage<SetLevelLikeResult>({
          levelId,
          liked: nextLiked,
          type: "SET_LEVEL_LIKE"
        }).then((response) => {
          setIsPending(false);

          if (!response || response.error || typeof response.liked !== "boolean") {
            setAuthStatus(response?.error ? "error" : authStatus);
            setError(response?.error ?? "Failed to update like.");
            return;
          }

          setAuthStatus("authenticated");
          setLiked(response.liked);
          setLikes(response.likes ?? Math.max(0, likes + (response.liked ? 1 : -1)));
        });
      },
      user
    }),
    [authStatus, error, isPending, levelId, liked, likes, user]
  );
}
