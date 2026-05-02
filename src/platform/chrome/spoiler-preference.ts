import { isExtensionContextAvailable } from "./extension-context";

const SPOILER_PROTECTION_DISABLED_KEY = "tufe.spoilerProtectionDisabled";

export async function loadSpoilerProtectionDisabled(): Promise<boolean> {
  if (!isStorageAvailable()) {
    return false;
  }

  const result = await chrome.storage.local.get(
    SPOILER_PROTECTION_DISABLED_KEY,
  );
  return result[SPOILER_PROTECTION_DISABLED_KEY] === true;
}

export async function saveSpoilerProtectionDisabled(
  value: boolean,
): Promise<void> {
  if (!isStorageAvailable()) {
    return;
  }

  await chrome.storage.local.set({
    [SPOILER_PROTECTION_DISABLED_KEY]: value,
  });
}

export function watchSpoilerProtectionDisabled(
  callback: (value: boolean) => void,
): () => void {
  if (!isStorageAvailable()) {
    return () => {};
  }

  function handleStorageChanged(
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void {
    if (areaName !== "local") {
      return;
    }

    const change = changes[SPOILER_PROTECTION_DISABLED_KEY];
    if (!change) {
      return;
    }

    callback(change.newValue === true);
  }

  chrome.storage.onChanged.addListener(handleStorageChanged);

  return () => {
    chrome.storage.onChanged.removeListener(handleStorageChanged);
  };
}

function isStorageAvailable(): boolean {
  return isExtensionContextAvailable() && Boolean(chrome.storage?.local);
}
