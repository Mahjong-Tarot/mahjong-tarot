// Display names for a series' weekly moments, shared by the list and the editor.
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
