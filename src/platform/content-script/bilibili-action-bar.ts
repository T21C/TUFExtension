import { logInfo } from "./logger";

const FLOATING_BUTTON_LEFT_PX = "24px";
const FLOATING_BUTTON_BOTTOM_PX = "24px";

export function insertHostIntoBilibiliActionBar(host: HTMLElement): boolean {
  if (!document.body.contains(host)) {
    document.body.append(host);
  }

  applyFloatingButtonHostStyle(host);
  logInfo("Mounted floating TUF button on Bilibili page");
  return true;
}

export function moveHostIntoBilibiliActionBar(host: HTMLElement): void {
  insertHostIntoBilibiliActionBar(host);
}

export function waitForBilibiliActionBar(host: HTMLElement): void {
  insertHostIntoBilibiliActionBar(host);
}

export function cancelPendingBilibiliActionBarMount(): void {}

function applyFloatingButtonHostStyle(host: HTMLElement): void {
  host.style.setProperty("position", "fixed");
  host.style.setProperty("left", FLOATING_BUTTON_LEFT_PX);
  host.style.setProperty("bottom", FLOATING_BUTTON_BOTTOM_PX);
  host.style.setProperty("z-index", "2147482500");
  host.style.setProperty("pointer-events", "auto");
}
