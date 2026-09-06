export function johannesburgDate(value: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
  }).format(value);
}

export function formatPlayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Date(year, month - 1, day).toLocaleDateString("af-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
