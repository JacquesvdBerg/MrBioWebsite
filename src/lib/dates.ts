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

export function formatDeskDate(value: string) {
  return new Date(value).toLocaleString("af-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeAf(value: string) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return value;
  }

  const minutes = Math.max(0, Math.round((Date.now() - then) / 60_000));

  if (minutes < 1) {
    return "Nou net";
  }
  if (minutes < 60) {
    return `${minutes} min gelede`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 uur gelede" : `${hours} uur gelede`;
  }

  const days = Math.round(hours / 24);
  if (days < 7) {
    return days === 1 ? "1 dag gelede" : `${days} dae gelede`;
  }

  const weeks = Math.round(days / 7);
  if (weeks < 5) {
    return weeks === 1 ? "1 week gelede" : `${weeks} weke gelede`;
  }

  return formatDeskDate(value);
}
