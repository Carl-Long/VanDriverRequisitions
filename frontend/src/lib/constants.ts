/**
 * Application-wide constants
 */

export const SIDEBAR_COLLAPSE_KEY = "sidebar-collapsed";

export const THEMES = [
  { label: "Light Brand", value: "light-brand" },
  { label: "Dark Brand", value: "dark-brand" },
  { label: "Light Mono", value: "light-mono" },
  { label: "Dark Mono", value: "dark-mono" },
  { label: "High Contrast", value: "high-contrast" }
] as const;

export type ThemeValue = (typeof THEMES)[number]["value"];

export const DEFAULT_THEME = "light-brand" as const;

export const THEME_OPTIONS = {
  attribute: "class" as const,
  enableSystem: false,
  disableTransitionOnChange: true,
  themes: THEMES.map((t) => t.value),
};


export const TEXT_SIZES = [
  { label: "Default", value: "default" },
  { label: "Large", value: "large" },
  { label: "Extra Large", value: "extra-large" },
  { label: "Largest", value: "largest" },
] as const;

export type TextSizeValue =
  (typeof TEXT_SIZES)[number]["value"];

export const DEFAULT_TEXT_SIZE = "default";