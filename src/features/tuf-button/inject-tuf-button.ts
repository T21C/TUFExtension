import { createTufButtonIcon } from "./tuf-button-icon";
import { logDebug, logInfo } from "@platform/content-script/logger";
import {
  cancelPendingBilibiliActionBarMount,
  insertHostIntoBilibiliActionBar,
  moveHostIntoBilibiliActionBar,
  waitForBilibiliActionBar
} from "@platform/content-script/bilibili-action-bar";
import {
  TUF_BUTTON_HOST_ID,
  TUF_BUTTON_ID
} from "@platform/content-script/tuf-button-elements";
import {
  cancelPendingActionBarMount,
  insertHostIntoYouTubeActionBar,
  moveHostIntoYouTubeActionBar,
  waitForYouTubeActionBar
} from "@platform/content-script/youtube-action-bar";
import type { ResolvedTufContext } from "@domain/tuf/types";
import type { VideoPlatform } from "@domain/video/types";

const YOUTUBE_BUTTON_CLASS_NAME =
  "ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeM ytSpecButtonShapeNextIconLeading ytSpecButtonShapeNextEnableBackdropFilterExperiment";
const ACTION_BUTTON_GAP_PX = "8px";
const BUTTON_GRADIENT = "linear-gradient(90deg, #2F0565 0%, #5339B2 100%)";
const BUTTON_HOVER_GRADIENT =
  "linear-gradient(90deg, #3B0877 0%, #6148C6 100%)";
const PRETENDARD_FONT_STACK = '"Pretendard", ui-sans-serif, system-ui, sans-serif';
const PRETENDARD_FONT_STYLE_ID = "tuf-level-helper-pretendard-font";
const PRETENDARD_FONT_FACE = `
@font-face {
  font-family: "Pretendard";
  font-display: swap;
  font-weight: 45 920;
  src: url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/woff2/PretendardVariable.woff2") format("woff2-variations");
}`;

export function injectTufButton(
  item: ResolvedTufContext,
  onClick: () => void
): void {
  cancelPendingMounts();

  const existingButton = getExistingButton();
  const platform = item.video.platform;

  if (existingButton) {
    logDebug("TUF button already exists; updating active item", {
      itemKey: item.itemKey
    });
    existingButton.dataset.tufItemKey = item.itemKey;
    existingButton.setAttribute("aria-label", `Open TUF: ${item.title}`);
    applyButtonPlatform(existingButton, platform);
    moveHostIntoActionBar(platform, existingButton.parentElement ?? existingButton);
    return;
  }

  logInfo("Injecting TUF button", {
    itemKey: item.itemKey,
    title: item.title
  });

  const host = document.createElement("div");
  host.id = TUF_BUTTON_HOST_ID;

  const button = document.createElement("button");
  button.id = TUF_BUTTON_ID;
  button.type = "button";
  button.setAttribute("aria-label", `Open TUF: ${item.title}`);
  button.dataset.tufItemKey = item.itemKey;
  button.addEventListener("click", onClick);
  applyButtonPlatform(button, platform);

  const label = document.createElement("span");
  label.textContent = "TUF";

  button.append(createTufButtonIcon(), label);
  host.append(button);

  applyHostPlatform(host, platform);

  if (insertHostIntoActionBar(platform, host)) {
    return;
  }

  logInfo(`${platform} action bar was not ready; waiting to mount TUF button`);
  waitForActionBar(platform, host);
}

export function removeTufButton(): void {
  cancelPendingMounts();
  const host = getExistingHost();

  if (host) {
    logInfo("Removing TUF button");
    host.remove();
  }
}

function getExistingButton(): HTMLButtonElement | null {
  return document.getElementById(TUF_BUTTON_ID) as HTMLButtonElement | null;
}

function getExistingHost(): HTMLElement | null {
  return document.getElementById(TUF_BUTTON_HOST_ID);
}

function applyBrandedButtonStyle(button: HTMLButtonElement): void {
  ensurePretendardFontFace();
  button.style.setProperty("background", BUTTON_GRADIENT);
  button.style.setProperty("color", "#FFFFFF");
  button.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  button.style.setProperty("box-shadow", "inset 0 0 0 1px rgba(255,255,255,0.14)");

  button.addEventListener("mouseenter", () => {
    button.style.setProperty("background", BUTTON_HOVER_GRADIENT);
  });
  button.addEventListener("mouseleave", () => {
    button.style.setProperty("background", BUTTON_GRADIENT);
  });
}

function applyBilibiliButtonStyle(button: HTMLButtonElement): void {
  ensurePretendardFontFace();
  button.className = "video-toolbar-left-item tuf-bilibili-action";
  button.style.setProperty("align-items", "center");
  button.style.setProperty("appearance", "none");
  button.style.setProperty("background", "transparent");
  button.style.setProperty("border", "0");
  button.style.setProperty("color", "#61666D");
  button.style.setProperty("cursor", "pointer");
  button.style.setProperty("display", "flex");
  button.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  button.style.setProperty("font-size", "13px");
  button.style.setProperty("font-weight", "500");
  button.style.setProperty("gap", "5px");
  button.style.setProperty("height", "28px");
  button.style.setProperty("line-height", "1");
  button.style.setProperty("margin", "0");
  button.style.setProperty("padding", "0");
  button.style.setProperty("transition", "color 160ms ease");

  button.addEventListener("mouseenter", () => {
    button.style.setProperty("color", "#00AEEC");
  });
  button.addEventListener("mouseleave", () => {
    button.style.setProperty("color", "#61666D");
  });

  const icon = button.querySelector("svg");
  icon?.setAttribute("width", "24");
  icon?.setAttribute("height", "24");
  icon?.style.setProperty("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.06))");
}

function applyButtonPlatform(
  button: HTMLButtonElement,
  platform: VideoPlatform
): void {
  resetButtonStyle(button);

  if (platform === "bilibili") {
    applyBilibiliButtonStyle(button);
    return;
  }

  button.className = YOUTUBE_BUTTON_CLASS_NAME;
  applyBrandedButtonStyle(button);
}

function applyHostPlatform(host: HTMLElement, platform: VideoPlatform): void {
  resetHostStyle(host);

  if (platform === "bilibili") {
    host.className = "tuf-bilibili-action-host";
    host.style.setProperty("display", "flex");
    host.style.setProperty("align-items", "center");
    host.style.setProperty("margin-right", "24px");
    return;
  }

  host.style.marginRight = ACTION_BUTTON_GAP_PX;
}

function insertHostIntoActionBar(
  platform: VideoPlatform,
  host: HTMLElement
): boolean {
  return platform === "bilibili"
    ? insertHostIntoBilibiliActionBar(host)
    : insertHostIntoYouTubeActionBar(host);
}

function moveHostIntoActionBar(platform: VideoPlatform, host: Element): void {
  if (!(host instanceof HTMLElement)) {
    return;
  }

  applyHostPlatform(host, platform);

  if (platform === "bilibili") {
    moveHostIntoBilibiliActionBar(host);
    return;
  }

  moveHostIntoYouTubeActionBar(host);
}

function waitForActionBar(platform: VideoPlatform, host: HTMLElement): void {
  if (platform === "bilibili") {
    waitForBilibiliActionBar(host);
    return;
  }

  waitForYouTubeActionBar(host);
}

function cancelPendingMounts(): void {
  cancelPendingActionBarMount();
  cancelPendingBilibiliActionBarMount();
}

function resetButtonStyle(button: HTMLButtonElement): void {
  button.removeAttribute("class");
  button.removeAttribute("style");
}

function resetHostStyle(host: HTMLElement): void {
  host.removeAttribute("class");
  host.removeAttribute("style");
}

function ensurePretendardFontFace(): void {
  if (document.getElementById(PRETENDARD_FONT_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = PRETENDARD_FONT_STYLE_ID;
  style.textContent = PRETENDARD_FONT_FACE;
  document.head.append(style);
}
