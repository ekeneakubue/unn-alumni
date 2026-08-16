import { Country, State } from "country-state-city";

export type CountryOption = {
  isoCode: string;
  name: string;
};

const countriesCache: CountryOption[] = Country.getAllCountries()
  .map((country) => ({
    isoCode: country.isoCode,
    name: country.name,
  }))
  .sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

export function getAllCountries(): CountryOption[] {
  return countriesCache;
}

function findCountry(countryName: string) {
  const trimmed = countryName.trim();
  if (!trimmed) return undefined;
  return (
    countriesCache.find((country) => country.name === trimmed) ??
    countriesCache.find(
      (country) => country.name.toLowerCase() === trimmed.toLowerCase(),
    )
  );
}

export function getStatesForCountry(countryName: string): string[] {
  const country = findCountry(countryName);
  if (!country) return [];

  return State.getStatesOfCountry(country.isoCode)
    .map((state) => state.name)
    .sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
}
