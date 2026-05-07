interface CountryFlagProps {
  className?: string;
  country: string;
}

export function CountryFlag({ className, country }: CountryFlagProps) {
  const code = normalizeCountryCode(country);
  const flagCodepoint = code ? countryCodeToFlagCodepoint(code) : null;

  if (!code || !flagCodepoint) {
    return (
      <span className={className} title={country}>
        {country}
      </span>
    );
  }

  return (
    <img
      alt={code}
      className={["inline-block object-contain", className ?? ""].join(" ")}
      decoding="async"
      loading="lazy"
      src={chrome.runtime.getURL(`twemoji/flags/${flagCodepoint}.svg`)}
      title={code}
    />
  );
}

function normalizeCountryCode(country: string): string | null {
  const code = country.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function countryCodeToFlagCodepoint(country: string): string {
  return [...country]
    .map((character) => (0x1f1e6 + character.charCodeAt(0) - 65).toString(16))
    .join("-");
}
