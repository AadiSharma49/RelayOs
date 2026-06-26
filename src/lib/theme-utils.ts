/**
 * Theme utility for future automatic day/night switching.
 *
 * DO NOT connect to UI yet — this is prepared for the next phase.
 */

/**
 * Returns "light" or "dark" based on the user's local time.
 *
 * Logic:
 *   06:00 → 18:00  = light
 *   18:00 → 06:00  = dark
 *
 * Uses the user's local timezone automatically via Date.
 */
export function getThemeByLocalTime(): "light" | "dark" {
  const hour = new Date().getHours()
  // 6 AM (inclusive) to 6 PM (exclusive) = light
  if (hour >= 6 && hour < 18) {
    return "light"
  }
  return "dark"
}

/**
 * Returns the display name for the current time-based theme.
 */
export function getThemeTimeLabel(): string {
  const theme = getThemeByLocalTime()
  if (theme === "light") {
    return "Day mode (06:00–18:00)"
  }
  return "Night mode (18:00–06:00)"
}