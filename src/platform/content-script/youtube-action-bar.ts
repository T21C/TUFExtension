import { logDebug, logInfo, logWarn } from "./logger";
import { TUF_BUTTON_HOST_ID } from "./tuf-button-elements";

const YOUTUBE_ACTION_BAR_SELECTORS = [
  "ytd-watch-metadata #top-level-buttons-computed",
  "ytd-watch-metadata ytd-menu-renderer #top-level-buttons-computed",
  "ytd-watch-metadata #actions ytd-menu-renderer #top-level-buttons-computed",
  "#actions ytd-menu-renderer #top-level-buttons-computed"
] as const;

const ACTION_BAR_SELECTOR_LABEL = YOUTUBE_ACTION_BAR_SELECTORS.join(", ");

let pendingObserver: MutationObserver | null = null;
let pendingTimeoutId: number | null = null;
let pendingRetryId: number | null = null;

export function insertHostIntoYouTubeActionBar(host: HTMLElement): boolean {
  const actionBar = getYouTubeActionBar();

  if (!actionBar) {
    return false;
  }

  if (actionBar.firstElementChild === host) {
    return true;
  }

  actionBar.insertBefore(host, actionBar.firstElementChild);
  logInfo("Mounted TUF button in YouTube action bar");
  return true;
}

export function moveHostIntoYouTubeActionBar(host: HTMLElement): void {
  if (!insertHostIntoYouTubeActionBar(host)) {
    logInfo(
      `Could not move existing TUF button yet; YouTube action bar missing (${ACTION_BAR_SELECTOR_LABEL})`
    );
    waitForYouTubeActionBar(host);
  }
}

export function waitForYouTubeActionBar(host: HTMLElement): void {
  let retryCount = 0;

  pendingRetryId = window.setInterval(() => {
    retryCount += 1;

    if (!insertHostIntoYouTubeActionBar(host)) {
      return;
    }

    logDebug("Mounted TUF button during retry", { retryCount });
    cancelPendingActionBarMount();
  }, 250);

  pendingObserver = new MutationObserver(() => {
    if (!insertHostIntoYouTubeActionBar(host)) {
      return;
    }

    cancelPendingActionBarMount();
  });

  pendingObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  pendingTimeoutId = window.setTimeout(() => {
    logWarn(
      `Stopped waiting for YouTube action bar; TUF button was not mounted (${ACTION_BAR_SELECTOR_LABEL})`
    );
    cancelPendingActionBarMount();
  }, 10_000);
}

export function cancelPendingActionBarMount(): void {
  pendingObserver?.disconnect();
  pendingObserver = null;

  if (pendingTimeoutId !== null) {
    window.clearTimeout(pendingTimeoutId);
    pendingTimeoutId = null;
  }

  if (pendingRetryId !== null) {
    window.clearInterval(pendingRetryId);
    pendingRetryId = null;
  }
}

function getYouTubeActionBar(): Element | null {
  for (const selector of YOUTUBE_ACTION_BAR_SELECTORS) {
    const actionBar = document.querySelector(selector);

    if (actionBar) {
      return actionBar;
    }
  }

  return null;
}
