export const MAX_FREE_LINKS = 10;
export const MAX_FREE_SOCIALS = 6;
export const FREE_METRICS_WINDOW_DAYS = 30;
export const PRO_METRICS_WINDOW_DAYS = 365;

export const THEMES = {
  aurora: {
    name: "Aurora",
    background: "from-purple-500 via-indigo-500 to-sky-500",
    text: "text-white",
    button: "bg-white/10 text-white hover:bg-white/20",
    radius: "xl"
  },
  solar: {
    name: "Solar",
    background: "from-amber-400 via-orange-500 to-rose-500",
    text: "text-slate-950",
    button: "bg-white text-slate-900 hover:bg-white/80",
    radius: "lg"
  },
  midnight: {
    name: "Midnight",
    background: "from-slate-900 via-slate-800 to-slate-900",
    text: "text-slate-100",
    button: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    radius: "2xl"
  }
} as const;

export type ThemeKey = keyof typeof THEMES;

export const DENSITY_SPACING = {
  compact: "space-y-2",
  comfortable: "space-y-4",
  relaxed: "space-y-6"
} as const;

export const SUPPORTED_SOCIALS = [
  "twitter",
  "github",
  "linkedin",
  "youtube",
  "twitch",
  "discord",
  "instagram",
  "facebook",
  "tiktok"
] as const;

export const HANDLE_REGEX = /^[a-z0-9._-]{3,30}$/;

export const PUBLIC_URL_PROTOCOLS = ["http:", "https:", "mailto:", "tel:", "whatsapp:"];
