import { logDebug, logInfo, logWarn } from "./logger";

const BILIBILI_ACTION_BAR_SELECTORS = [
  ".video-toolbar-left",
  ".video-toolbar-container .video-toolbar-left"
] as const;

const BILIBILI_SHARE_SELECTORS = [
  ".video-toolbar-left .video-share",
  ".video-toolbar-left .video-share-wrap",
  ".video-toolbar-left [title*='分享']"
] as const;

const ACTION_BAR_SELECTOR_LABEL = BILIBILI_ACTION_BAR_SELECTORS.join(", ");

let pendingObserver: MutationObserver | null = null;
let pendingTimeoutId: number | null = null;
let pendingRetryId: number | null = null;
let keepAliveObserver: MutationObserver | null = null;
let keepAliveIntervalId: number | null = null;

export function insertHostIntoBilibiliActionBar(host: HTMLElement): boolean {
  const actionBar = getBilibiliActionBar();

  if (!actionBar) {
    return false;
  }

  const anchor = getBilibiliInsertAnchor(actionBar);

  if (anchor.nextElementSibling === host) {
    return true;
  }

  anchor.insertAdjacentElement("afterend", host);
  keepHostInBilibiliActionBar(host);

  logInfo("Mounted TUF button in Bilibili action bar");
  return true;
}

export function moveHostIntoBilibiliActionBar(host: HTMLElement): void {
  if (!insertHostIntoBilibiliActionBar(host)) {
    logInfo(
      `Could not move existing TUF button yet; Bilibili action bar missing (${ACTION_BAR_SELECTOR_LABEL})`
    );
    waitForBilibiliActionBar(host);
  }
}

export function waitForBilibiliActionBar(host: HTMLElement): void {
  cancelPendingBilibiliActionBarMount();
  let retryCount = 0;

  pendingRetryId = window.setInterval(() => {
    retryCount += 1;

    if (!insertHostIntoBilibiliActionBar(host)) {
      return;
    }

    logDebug("Mounted TUF button in Bilibili action bar during retry", {
      retryCount
    });
    cancelBilibiliActionBarWait();
  }, 250);

  pendingObserver = new MutationObserver(() => {
    if (!insertHostIntoBilibiliActionBar(host)) {
      return;
    }

    cancelBilibiliActionBarWait();
  });

  pendingObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  pendingTimeoutId = window.setTimeout(() => {
    logWarn(
      `Stopped waiting for Bilibili action bar; TUF button was not mounted (${ACTION_BAR_SELECTOR_LABEL})`
    );
    cancelPendingBilibiliActionBarMount();
  }, 10_000);
}

export function cancelPendingBilibiliActionBarMount(): void {
  cancelBilibiliActionBarWait();
  keepAliveObserver?.disconnect();
  keepAliveObserver = null;

  if (keepAliveIntervalId !== null) {
    window.clearInterval(keepAliveIntervalId);
    keepAliveIntervalId = null;
  }
}

function cancelBilibiliActionBarWait(): void {
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

function getBilibiliActionBar(): Element | null {
  for (const selector of BILIBILI_ACTION_BAR_SELECTORS) {
    const actionBar = document.querySelector(selector);

    if (actionBar) {
      return actionBar;
    }
  }

  return null;
}

function getBilibiliInsertAnchor(actionBar: Element): Element {
  return getShareActionHost(actionBar) ?? actionBar.lastElementChild ?? actionBar;
}

function getShareActionHost(actionBar: Element): Element | null {
  for (const selector of BILIBILI_SHARE_SELECTORS) {
    const shareAction = document.querySelector(selector);

    if (!shareAction || !actionBar.contains(shareAction)) {
      continue;
    }

    return shareAction.closest(".toolbar-left-item-wrap") ?? shareAction;
  }

  return null;
}

function keepHostInBilibiliActionBar(host: HTMLElement): void {
  if (keepAliveObserver || keepAliveIntervalId !== null) {
    return;
  }

  const ensureMounted = () => {
    if (!document.body.contains(host)) {
      insertHostIntoBilibiliActionBar(host);
    }
  };

  keepAliveObserver = new MutationObserver(ensureMounted);
  keepAliveObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  keepAliveIntervalId = window.setInterval(ensureMounted, 1000);
}
