import { createTufButtonIcon } from "./tuf-button-icon";
import { logDebug, logInfo } from "@platform/content-script/logger";
import {
  cancelPendingActionBarMount,
  insertHostIntoYouTubeActionBar,
  moveHostIntoYouTubeActionBar,
  TUF_BUTTON_HOST_ID,
  TUF_BUTTON_ID,
  waitForYouTubeActionBar
} from "@platform/content-script/youtube-action-bar";
import type { ResolvedLevelContext } from "@domain/tuf/types";

const BUTTON_CLASS_NAME =
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
  level: ResolvedLevelContext,
  onClick: () => void
): void {
  cancelPendingActionBarMount();

  const existingButton = getExistingButton();

  if (existingButton) {
    logDebug("TUF button already exists; updating level id", {
      levelId: level.levelId
    });
    existingButton.dataset.levelId = level.levelId;
    applyBrandedButtonStyle(existingButton);
    moveHostIntoYouTubeActionBar(existingButton.parentElement ?? existingButton);
    return;
  }

  logInfo("Injecting TUF button", {
    levelId: level.levelId,
    title: level.title
  });

  const host = document.createElement("div");
  host.id = TUF_BUTTON_HOST_ID;
  host.style.marginRight = ACTION_BUTTON_GAP_PX;

  const button = document.createElement("button");
  button.id = TUF_BUTTON_ID;
  button.type = "button";
  button.className = BUTTON_CLASS_NAME;
  button.setAttribute("aria-label", `Open TUF level: ${level.title}`);
  button.dataset.levelId = level.levelId;
  button.addEventListener("click", onClick);
  applyBrandedButtonStyle(button);

  const label = document.createElement("span");
  label.textContent = "TUF";

  button.append(createTufButtonIcon(), label);
  host.append(button);

  if (insertHostIntoYouTubeActionBar(host)) {
    return;
  }

  logInfo("YouTube action bar was not ready; waiting to mount TUF button");
  waitForYouTubeActionBar(host);
}

export function removeTufButton(): void {
  cancelPendingActionBarMount();
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

function ensurePretendardFontFace(): void {
  if (document.getElementById(PRETENDARD_FONT_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = PRETENDARD_FONT_STYLE_ID;
  style.textContent = PRETENDARD_FONT_FACE;
  document.head.append(style);
}
