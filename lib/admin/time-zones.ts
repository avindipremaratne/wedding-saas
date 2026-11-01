// The IANA time zones this runtime knows, for the admin form's suggestions.
export function timeZones(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: "timeZone") => string[] };
  return intl.supportedValuesOf?.("timeZone") ?? ["UTC"];
}
