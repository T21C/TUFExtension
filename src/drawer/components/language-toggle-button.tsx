import {
  getNextLanguageFrom,
  t,
  type SupportedLanguage,
} from "~/platform/chrome/i18n";

interface LanguageToggleButtonProps {
  language: SupportedLanguage;
  onClick: () => void;
}

export function LanguageToggleButton({
  language,
  onClick,
}: LanguageToggleButtonProps) {
  const nextLanguage = getNextLanguageFrom(language);
  const label = getLanguageLabel(nextLanguage);

  return (
    <button
      aria-label={label}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-black uppercase text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      onClick={onClick}
      title={label}
      type="button"
    >
      {getLanguageCode(language)}
    </button>
  );
}

function getLanguageLabel(language: SupportedLanguage): string {
  if (language === "ko") {
    return t("languageSwitchToKorean");
  }

  if (language === "zh_CN") {
    return t("languageSwitchToChinese");
  }

  return t("languageSwitchToEnglish");
}

function getLanguageCode(language: SupportedLanguage): string {
  return language === "zh_CN" ? "ZH" : language.toUpperCase();
}
