import { logDebug, logInfo } from "./logger";

export function watchUrlChanges(callback: () => void): void {
  let previousUrl = window.location.href;

  const checkForChange = () => {
    if (window.location.href === previousUrl) {
      return;
    }

    logInfo("Page URL changed", {
      from: previousUrl,
      to: window.location.href
    });
    previousUrl = window.location.href;
    callback();
  };

  const patchHistoryMethod = (method: "pushState" | "replaceState") => {
    const original = window.history[method];

    window.history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      window.setTimeout(checkForChange, 0);
      return result;
    };
  };

  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");
  window.addEventListener("popstate", checkForChange);
  window.setInterval(checkForChange, 1000);
  logDebug("URL watcher installed");
}
