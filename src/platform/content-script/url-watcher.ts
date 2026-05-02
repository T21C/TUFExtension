import { logDebug, logInfo } from "./logger";

const YOUTUBE_NAVIGATION_EVENTS = [
  "yt-navigate-finish",
  "yt-page-data-updated",
  "yt-player-updated",
] as const;
const DOM_SETTLE_CHECK_DELAYS_MS = [100, 500, 1500] as const;

export function watchUrlChanges(callback: () => void): void {
  let previousUrl = window.location.href;

  const checkForChange = () => {
    if (window.location.href === previousUrl) {
      return;
    }

    logInfo("Page URL changed", {
      from: previousUrl,
      to: window.location.href,
    });
    previousUrl = window.location.href;
    callback();
  };

  const scheduleSettledChecks = () => {
    for (const delay of DOM_SETTLE_CHECK_DELAYS_MS) {
      window.setTimeout(callback, delay);
    }
  };

  const handleYouTubeNavigation = (event: Event) => {
    logDebug("YouTube navigation event detected", {
      eventType: event.type,
      href: window.location.href,
    });
    checkForChange();
    scheduleSettledChecks();
  };

  const patchHistoryMethod = (method: "pushState" | "replaceState") => {
    const original = window.history[method];

    window.history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      window.setTimeout(checkForChange, 0);
      window.setTimeout(scheduleSettledChecks, 0);
      return result;
    };
  };

  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");
  window.addEventListener("popstate", checkForChange);
  for (const eventName of YOUTUBE_NAVIGATION_EVENTS) {
    window.addEventListener(eventName, handleYouTubeNavigation);
  }
  window.setInterval(checkForChange, 1000);
  logDebug("URL watcher installed");
}
