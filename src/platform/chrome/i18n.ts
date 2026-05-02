import { isExtensionContextAvailable } from "./extension-context";
import enMessages from "../../../public/_locales/en/messages.json";
import koMessages from "../../../public/_locales/ko/messages.json";
import zhCnMessages from "../../../public/_locales/zh_CN/messages.json";

export type SupportedLanguage = "en" | "ko" | "zh_CN";

interface LocaleMessage {
  message?: string;
  placeholders?: Record<string, { content?: string }>;
}

type LocaleMessages = Record<string, LocaleMessage>;

const LANGUAGE_PREFERENCE_KEY = "tufe.language";
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "ko", "zh_CN"];

const loadedMessages: Record<SupportedLanguage, LocaleMessages> = {
  en: enMessages,
  ko: koMessages,
  zh_CN: zhCnMessages,
};
let activeLanguage: SupportedLanguage = getBrowserLanguage();

export function t(key: string, substitutions?: string | string[]): string {
  const messageEntry = loadedMessages[activeLanguage]?.[key];
  const messageTemplate = messageEntry?.message;

  if (messageTemplate) {
    return applySubstitutions(messageTemplate, substitutions, messageEntry);
  }

  const message = chrome.i18n.getMessage(key, substitutions);
  return message || key;
}

export function getActiveLanguage(): SupportedLanguage {
  return activeLanguage;
}

export function getNextLanguage(): SupportedLanguage {
  return getNextLanguageFrom(activeLanguage);
}

export function getNextLanguageFrom(
  language: SupportedLanguage,
): SupportedLanguage {
  const index = SUPPORTED_LANGUAGES.indexOf(language);
  return SUPPORTED_LANGUAGES[(index + 1) % SUPPORTED_LANGUAGES.length];
}

export async function hydrateLanguagePreference(): Promise<SupportedLanguage> {
  const nextLanguage = await loadLanguagePreference();
  await setActiveLanguage(nextLanguage);
  return nextLanguage;
}

export async function saveLanguagePreference(
  language: SupportedLanguage,
): Promise<void> {
  await setActiveLanguage(language);

  if (!isStorageAvailable()) {
    return;
  }

  await chrome.storage.local.set({
    [LANGUAGE_PREFERENCE_KEY]: language,
  });
}

export function watchLanguagePreference(
  callback: (language: SupportedLanguage) => void,
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

    const change = changes[LANGUAGE_PREFERENCE_KEY];
    const nextLanguage = normalizeLanguage(change?.newValue);

    if (!nextLanguage) {
      return;
    }

    void setActiveLanguage(nextLanguage).then(() => {
      callback(nextLanguage);
    });
  }

  chrome.storage.onChanged.addListener(handleStorageChanged);

  return () => {
    chrome.storage.onChanged.removeListener(handleStorageChanged);
  };
}

async function loadLanguagePreference(): Promise<SupportedLanguage> {
  if (!isStorageAvailable()) {
    return getBrowserLanguage();
  }

  const result = await chrome.storage.local.get(LANGUAGE_PREFERENCE_KEY);
  return (
    normalizeLanguage(result[LANGUAGE_PREFERENCE_KEY]) ?? getBrowserLanguage()
  );
}

async function setActiveLanguage(language: SupportedLanguage): Promise<void> {
  activeLanguage = language;
  await loadLocaleMessages(language);
}

async function loadLocaleMessages(language: SupportedLanguage): Promise<void> {
  void language;
}

function applySubstitutions(
  message: string,
  substitutions?: string | string[],
  messageEntry?: LocaleMessage,
): string {
  const values = Array.isArray(substitutions)
    ? substitutions
    : typeof substitutions === "string"
      ? [substitutions]
      : [];

  let result = message;
  const placeholderNames = Object.keys(messageEntry?.placeholders ?? {});

  values.forEach((value, index) => {
    result = result.replaceAll(`$${index + 1}`, value);

    const placeholderName = placeholderNames[index];
    if (placeholderName) {
      result = result.replaceAll(`$${placeholderName.toUpperCase()}$`, value);
    }
  });

  return result;
}

function getBrowserLanguage(): SupportedLanguage {
  const language = chrome.i18n.getUILanguage?.() ?? "";
  const normalizedLanguage = language.toLowerCase();

  if (normalizedLanguage.startsWith("ko")) {
    return "ko";
  }

  if (normalizedLanguage.startsWith("zh")) {
    return "zh_CN";
  }

  return "en";
}

function normalizeLanguage(value: unknown): SupportedLanguage | null {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
    ? (value as SupportedLanguage)
    : null;
}

function isStorageAvailable(): boolean {
  return isExtensionContextAvailable() && Boolean(chrome.storage?.local);
}
