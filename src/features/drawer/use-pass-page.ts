import { useEffect, useMemo, useState } from "react";
import {
  sendRuntimeMessage,
  type GetPassPageDataResult,
} from "~/platform/chrome/runtime-message";
import { t } from "~/platform/chrome/i18n";
import type {
  PassPageLoadState,
  ResolvedPassContext,
} from "~/domain/tuf/types";

interface UsePassPageParams {
  activePassId: string;
  passes: ResolvedPassContext[];
}

export function usePassPage({ activePassId, passes }: UsePassPageParams): {
  activePass: ResolvedPassContext;
  activeState: PassPageLoadState;
  retryActivePass: () => void;
} {
  const [loadStates, setLoadStates] = useState<
    Record<string, PassPageLoadState>
  >({});
  const [retryNonce, setRetryNonce] = useState(0);
  const activePass = useMemo(
    () => passes.find((pass) => pass.passId === activePassId) ?? passes[0],
    [activePassId, passes],
  );
  const activeState = loadStates[activePass.passId] ?? { isLoading: true };

  useEffect(() => {
    const knownPassIds = new Set(passes.map((pass) => pass.passId));
    setLoadStates((current) => {
      const next: Record<string, PassPageLoadState> = {};

      for (const [passId, state] of Object.entries(current)) {
        if (knownPassIds.has(passId)) {
          next[passId] = state;
        }
      }

      return next;
    });
  }, [passes]);

  useEffect(() => {
    const passId = activePass.passId;
    const current = loadStates[passId];

    if (current?.data && retryNonce === 0) {
      return;
    }

    let isCancelled = false;

    setLoadStates((states) => ({
      ...states,
      [passId]: {
        data: states[passId]?.data,
        error: undefined,
        isLoading: true,
      },
    }));

    void sendRuntimeMessage<GetPassPageDataResult>({
      passId,
      type: "GET_PASS_PAGE_DATA",
    }).then((response) => {
      if (isCancelled) {
        return;
      }

      if (!response?.data) {
        setLoadStates((states) => ({
          ...states,
          [passId]: {
            error: response?.error ?? t("failedLoadPassData"),
            isLoading: false,
          },
        }));
        return;
      }

      setLoadStates((states) => ({
        ...states,
        [passId]: {
          data: response.data,
          isLoading: false,
        },
      }));
    });

    return () => {
      isCancelled = true;
    };
  }, [activePass.passId, retryNonce]);

  return {
    activePass,
    activeState,
    retryActivePass: () => setRetryNonce((value) => value + 1),
  };
}
