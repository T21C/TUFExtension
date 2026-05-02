import { createRoot, type Root } from "react-dom/client";
import { DrawerRoot } from "./root";
import { ensureShadowHost } from "~/platform/content-script/shadow-host";
import {
  TUF_BUTTON_HOST_ID,
  TUF_BUTTON_ID,
} from "~/platform/content-script/tuf-button-elements";
import {
  loadSpoilerProtectionDisabled,
  saveSpoilerProtectionDisabled,
  watchSpoilerProtectionDisabled,
} from "~/platform/chrome/spoiler-preference";
import { logDebug, logInfo } from "~/platform/content-script/logger";
import type { ResolvedTufContext } from "~/domain/tuf/types";

const DRAWER_HOST_ID = "tuf-level-helper-drawer-host";
const PRETENDARD_FONT_STACK =
  '"Pretendard", ui-sans-serif, system-ui, sans-serif';

let root: Root | null = null;
let host: HTMLElement | null = null;
let currentItems: ResolvedTufContext[] = [];
let activeItemKey: string | null = null;
let isDrawerOpen = false;
let isDrawerPinned = false;
let isDrawerResolving = false;
let isSpoilerProtectionDisabled = false;
let drawerEmptyReason: string | null = null;
let listenersInstalled = false;
let drawerScrollListenersInstalled = false;
let spoilerPreferenceHydrationStarted = false;
let spoilerPreferenceListenerInstalled = false;

export function mountOrUpdateDrawer(
  items: ResolvedTufContext[],
  options: {
    activeItemKey?: string;
    emptyReason?: string;
    isResolving?: boolean;
    open?: boolean;
  } = {},
): void {
  const shouldRenderEmptyState =
    items.length === 0 && (isDrawerPinned || options.open === true);

  if (items.length === 0 && !shouldRenderEmptyState) {
    clearDrawer();
    return;
  }

  currentItems = items;
  activeItemKey =
    items.length > 0
      ? getNextActiveItemKey(items, options.activeItemKey)
      : null;
  isDrawerResolving = options.isResolving ?? false;
  drawerEmptyReason = options.emptyReason ?? null;

  if (typeof options.open === "boolean") {
    isDrawerOpen = options.open;
  }

  logDebug("Preloading TUF drawer context", {
    activeItemKey,
    count: items.length,
    itemKeys: items.map((item) => item.itemKey),
    pinned: isDrawerPinned,
    resolving: isDrawerResolving,
    open: isDrawerOpen,
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
  isDrawerResolving = false;
  drawerEmptyReason = null;
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

export function isDrawerPinnedOpen(): boolean {
  return isDrawerOpen && isDrawerPinned;
}

export function clearDrawer(): void {
  logInfo("Clearing injected TUF drawer");
  isDrawerOpen = false;
  currentItems = [];
  activeItemKey = null;
  isDrawerResolving = false;
  drawerEmptyReason = null;
  root?.unmount();
  root = null;
  host?.remove();
  host = null;
  drawerScrollListenersInstalled = false;
}

function renderDrawer(): void {
  if (currentItems.length === 0 && !isDrawerResolving && !drawerEmptyReason) {
    clearDrawer();
    return;
  }

  activeItemKey =
    currentItems.length > 0 ? getNextActiveItemKey(currentItems) : null;
  hydrateSpoilerPreference();
  ensureDrawerRoot();
  installGlobalListeners();
  installSpoilerPreferenceListener();
  updateDrawerHostInteraction();

  root?.render(
    <DrawerRoot
      activeItemKey={activeItemKey}
      emptyReason={drawerEmptyReason}
      isOpen={isDrawerOpen}
      isPinned={isDrawerPinned}
      isResolving={isDrawerResolving}
      isSpoilerProtectionDisabled={isSpoilerProtectionDisabled}
      items={currentItems}
      onClose={closeDrawer}
      onSelectItem={selectDrawerItem}
      onTogglePinned={togglePinned}
      onToggleSpoilerProtection={toggleSpoilerProtection}
    />,
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

function togglePinned(): void {
  isDrawerPinned = !isDrawerPinned;

  logInfo("Toggled TUF drawer pin", {
    pinned: isDrawerPinned,
  });
  renderDrawer();
}

function toggleSpoilerProtection(): void {
  isSpoilerProtectionDisabled = !isSpoilerProtectionDisabled;

  logInfo("Toggled TUF drawer spoiler protection", {
    disabled: isSpoilerProtectionDisabled,
  });
  renderDrawer();

  void saveSpoilerProtectionDisabled(isSpoilerProtectionDisabled).catch(
    (error: unknown) => {
      logInfo("Failed to save TUF drawer spoiler preference", error);
    },
  );
}

function hydrateSpoilerPreference(): void {
  if (spoilerPreferenceHydrationStarted) {
    return;
  }

  spoilerPreferenceHydrationStarted = true;
  void loadSpoilerProtectionDisabled()
    .then((value) => {
      if (isSpoilerProtectionDisabled === value) {
        return;
      }

      isSpoilerProtectionDisabled = value;
      logInfo("Hydrated TUF drawer spoiler preference", {
        disabled: isSpoilerProtectionDisabled,
      });
      renderDrawer();
    })
    .catch((error: unknown) => {
      logInfo("Failed to load TUF drawer spoiler preference", error);
    });
}

function installSpoilerPreferenceListener(): void {
  if (spoilerPreferenceListenerInstalled) {
    return;
  }

  spoilerPreferenceListenerInstalled = true;
  watchSpoilerProtectionDisabled((value) => {
    if (isSpoilerProtectionDisabled === value) {
      return;
    }

    isSpoilerProtectionDisabled = value;
    logInfo("Synced TUF drawer spoiler preference", {
      disabled: isSpoilerProtectionDisabled,
    });
    renderDrawer();
  });
}

function getNextActiveItemKey(
  items: ResolvedTufContext[],
  requestedItemKey = activeItemKey,
): string {
  if (
    requestedItemKey &&
    items.some((item) => item.itemKey === requestedItemKey)
  ) {
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
    onMountNodeCreate: applyMountNodeStyle,
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
    passive: false,
  });
  element.addEventListener("touchmove", stopDrawerScrollPropagation, {
    capture: true,
    passive: false,
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

  if (isDrawerPinned) {
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

  if (isDrawerPinned) {
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
