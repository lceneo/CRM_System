export function splitByDays(
  startTime: Date | string | number,
  endTime: Date | string | number
) {
  let startTimestamp = new Date(startTime).setHours(0, 0, 0, 0);
  const endTimestamp = new Date(endTime).setHours(0, 0, 0, 0);
  const msInDay = 1000 * 60 * 60 * 24;

  const dates: Date[] = [];

  while (startTimestamp <= endTimestamp) {
    dates.push(new Date(startTimestamp));
    startTimestamp += msInDay;
  }
  return dates;
}
