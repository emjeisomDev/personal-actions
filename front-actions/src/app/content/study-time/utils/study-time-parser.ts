export function parseStudyTime(value: string): number | null 
{
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(',', '.');

  if (!normalizedValue) {
    return null;
  }

  const clockMatch = normalizedValue.match(
    /^(\d{1,3}):([0-5]\d)$/
  );

  if (clockMatch) {
    const hours = Number(clockMatch[1]);
    const minutes = Number(clockMatch[2]);

    return hours * 60 + minutes;
  }

  const hourMinuteMatch = normalizedValue.match(
    /^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+)\s*min?)?$/
  );

  if (
    hourMinuteMatch &&
    (hourMinuteMatch[1] || hourMinuteMatch[2])
  ) {
    const hours = hourMinuteMatch[1]
      ? Number(hourMinuteMatch[1])
      : 0;

    const minutes = hourMinuteMatch[2]
      ? Number(hourMinuteMatch[2])
      : 0;

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      minutes >= 60
    ) {
      return null;
    }

    return Math.round(
      hours * 60 + minutes
    );
  }

  const minutesOnly = normalizedValue.match(
    /^(\d+(?:\.\d+)?)\s*(?:min)?$/
  );

  if (minutesOnly) {
    const minutes = Number(
      minutesOnly[1]
    );

    if (!Number.isFinite(minutes)) {
      return null;
    }

    return Math.round(minutes);
  }

  return null;
}