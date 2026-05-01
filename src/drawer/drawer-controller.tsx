import { createRoot, type Root } from "react-dom/client";
import { DrawerRoot } from "./root";
import { ensureShadowHost } from "@platform/content-script/shadow-host";
import {
  TUF_BUTTON_HOST_ID,
  TUF_BUTTON_ID
} from "@platform/content-script/youtube-action-bar";
import { logDebug, logInfo } from "@platform/content-script/logger";
import type { ResolvedTufContext } from "@domain/tuf/types";

const DRAWER_HOST_ID = "tuf-level-helper-drawer-host";
const PRETENDARD_FONT_STACK = '"Pretendard", ui-sans-serif, system-ui, sans-serif';

let root: Root | null = null;
let host: HTMLElement | null = null;
let currentItems: ResolvedTufContext[] = [];
let activeItemKey: string | null = null;
let isDrawerOpen = false;
let listenersInstalled = false;
let drawerScrollListenersInstalled = false;

export function mountOrUpdateDrawer(
  items: ResolvedTufContext[],
  options: { activeItemKey?: string; open?: boolean } = {}
): void {
  if (items.length === 0) {
    clearDrawer();
    return;
  }

  currentItems = items;
  activeItemKey = getNextActiveItemKey(items, options.activeItemKey);

  if (typeof options.open === "boolean") {
    isDrawerOpen = options.open;
  }

  logDebug("Preloading TUF drawer context", {
    activeItemKey,
    count: items.length,
    itemKeys: items.map((item) => item.itemKey),
    open: isDrawerOpen
  });
  renderDrawer();
}

export function toggleDrawer(items: ResolvedTufContext[]): void {
  if (items.length === 0) {
    clearDrawer();
    return;
  }

  currentItems = items;
  activeItemKey = getNextActiveItemKey(items);
  isDrawerOpen = !isDrawerOpen;

  logInfo("Toggling injected TUF drawer", {
    activeItemKey,
    count: items.length,
    itemKeys: items.map((item) => item.itemKey),
    open: isDrawerOpen,
  });

  if (!isDrawerOpen) {
    closeDrawer();
    return;
  }

  renderDrawer();
}

export function closeDrawer(): void {
  if (!host && !root) {
    isDrawerOpen = false;
    return;
  }

  logInfo("Closing injected TUF drawer");
  isDrawerOpen = false;
  renderDrawer();
}

export function clearDrawer(): void {
  logInfo("Clearing injected TUF drawer");
  isDrawerOpen = false;
  currentItems = [];
  activeItemKey = null;
  root?.unmount();
  root = null;
  host?.remove();
  host = null;
  drawerScrollListenersInstalled = false;
}

function renderDrawer(): void {
  if (currentItems.length === 0) {
    clearDrawer();
    return;
  }

  activeItemKey = getNextActiveItemKey(currentItems);
  ensureDrawerRoot();
  installGlobalListeners();
  updateDrawerHostInteraction();

  root?.render(
    <DrawerRoot
      activeItemKey={activeItemKey}
      isOpen={isDrawerOpen}
      items={currentItems}
      onClose={closeDrawer}
      onSelectItem={selectDrawerItem}
    />
  );
}

function selectDrawerItem(nextItemKey: string): void {
  if (!currentItems.some((item) => item.itemKey === nextItemKey)) {
    return;
  }

  activeItemKey = nextItemKey;
  logDebug("Selected TUF drawer tab", { itemKey: nextItemKey });
  renderDrawer();
}

function getNextActiveItemKey(
  items: ResolvedTufContext[],
  requestedItemKey = activeItemKey
): string {
  if (requestedItemKey && items.some((item) => item.itemKey === requestedItemKey)) {
    return requestedItemKey;
  }

  return items[0].itemKey;
}

function ensureDrawerRoot(): void {
  if (root && host?.isConnected) {
    return;
  }

  const { host: nextHost, mountNode } = ensureShadowHost({
    hostId: DRAWER_HOST_ID,
    onHostCreate: applyDrawerHostStyle,
    onMountNodeCreate: applyMountNodeStyle
  });

  host = nextHost;
  installDrawerScrollBoundaryListeners(host);
  root = createRoot(mountNode);
}

function applyDrawerHostStyle(element: HTMLElement): void {
  element.style.setProperty("position", "fixed");
  element.style.setProperty("top", "12px");
  element.style.setProperty("right", "12px");
  element.style.setProperty("bottom", "12px");
  element.style.setProperty("width", "min(520px, calc(100vw - 24px))");
  element.style.setProperty("max-width", "calc(100vw - 24px)");
  element.style.setProperty("z-index", "2147483000");
  element.style.setProperty("overflow", "visible");
  element.style.setProperty("pointer-events", "none");
  element.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  element.style.setProperty("font-size", "16px");
  element.style.setProperty("line-height", "1.5");
  element.style.setProperty("color-scheme", "dark");
  element.style.setProperty("--spacing", "4px");
  element.style.setProperty("--text-xs", "12px");
  element.style.setProperty("--text-xs--line-height", "16px");
  element.style.setProperty("--text-sm", "14px");
  element.style.setProperty("--text-sm--line-height", "20px");
  element.style.setProperty("--text-lg", "18px");
  element.style.setProperty("--text-lg--line-height", "28px");
  element.style.setProperty("--text-xl", "20px");
  element.style.setProperty("--text-xl--line-height", "28px");
  element.style.setProperty("--text-3xl", "30px");
  element.style.setProperty("--text-3xl--line-height", "36px");
}

function updateDrawerHostInteraction(): void {
  host?.style.setProperty("pointer-events", isDrawerOpen ? "auto" : "none");
}

function applyMountNodeStyle(element: HTMLElement): void {
  element.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  element.style.setProperty("font-size", "16px");
  element.style.setProperty("height", "100%");
  element.style.setProperty("line-height", "1.5");
}

function installGlobalListeners(): void {
  if (listenersInstalled) {
    return;
  }

  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("pointerdown", handlePointerDown, true);
  listenersInstalled = true;
}

function installDrawerScrollBoundaryListeners(element: HTMLElement): void {
  if (drawerScrollListenersInstalled) {
    return;
  }

  element.addEventListener("wheel", stopDrawerScrollPropagation, {
    capture: true,
    passive: false
  });
  element.addEventListener("touchmove", stopDrawerScrollPropagation, {
    capture: true,
    passive: false
  });
  drawerScrollListenersInstalled = true;
}

function stopDrawerScrollPropagation(event: Event): void {
  if (!isDrawerOpen) {
    return;
  }

  event.stopPropagation();
}

function handleKeyDown(event: KeyboardEvent): void {
  if (!isDrawerOpen || event.key !== "Escape") {
    return;
  }

  closeDrawer();
}

function handlePointerDown(event: PointerEvent): void {
  if (!isDrawerOpen || !host) {
    return;
  }

  const path = event.composedPath();

  if (path.includes(host) || path.some(isTufButtonNode)) {
    return;
  }

  closeDrawer();
}

function isTufButtonNode(value: EventTarget): boolean {
  return (
    value instanceof HTMLElement &&
    (value.id === TUF_BUTTON_HOST_ID || value.id === TUF_BUTTON_ID)
  );
}
