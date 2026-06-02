export const DIET_MAP: Record<string, string> = {
  'g': 'gluteeniton',
  'l': 'laktoositon',
  'm': 'maidoton',
  've': 'vegaaninen',
  'vl': 'vähälaktoosinen',
  'veg': 'vegaaninen',
  'v': 'vegaaninen'
};

export const DAYS_FI = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
export const DAYS_FI_SHORT = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
export const DAYS_FI_CAPS = ['SU', 'MA', 'TI', 'KE', 'TO', 'PE', 'LA'];

export function getTodayDayName() {
  return DAYS_FI[new Date().getDay()];
}

export function getTodayDayShort() {
  return DAYS_FI_SHORT[new Date().getDay()];
}

export function getTodayDayCaps() {
  return DAYS_FI_CAPS[new Date().getDay()];
}

export interface MenuItem {
  name: string;
  diets: string[];
  today?: boolean;
}

export interface RestaurantMenu {
  date: string;
  items: MenuItem[];
  source: string;
  error?: string;
}

export function parseDiets(text: string): string[] {
  const matches = text.match(/\(([^)]+)\)/g) || [];
  if (!matches.length) return [];
  const last = matches[matches.length - 1].replace(/[()]/g, '');
  const codes = last.match(/[A-Za-z]+/g) || [];
  return codes
    .map(c => DIET_MAP[c.toLowerCase()])
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v!) === i) as string[];
}

// Splits "Jauhelihatacot ja herkulliset lisukkeet L,G" into
// { name: "Jauhelihatacot ja herkulliset lisukkeet", diets: ["laktoositon","gluteeniton"] }
// Codes may be at end of line either in parens, comma-separated, or space-separated.
export function extractItem(raw: string): MenuItem | null {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 3) return null;

  // Try parens first
  const parenMatch = cleaned.match(/^(.*?)\s*\(([A-Za-z, ]+)\)\s*$/);
  if (parenMatch) {
    return {
      name: parenMatch[1].trim(),
      diets: mapCodes(parenMatch[2]),
    };
  }

  // Try trailing codes like "... L,G" or "... L, G" or "... M G"
  const tailMatch = cleaned.match(/^(.+?)\s+((?:[A-Za-z]{1,3})(?:\s*,\s*[A-Za-z]{1,3})*)$/);
  if (tailMatch) {
    const codes = mapCodes(tailMatch[2]);
    if (codes.length > 0) {
      return { name: tailMatch[1].trim(), diets: codes };
    }
  }

  return { name: cleaned, diets: [] };
}

function mapCodes(s: string): string[] {
  const codes = s.match(/[A-Za-z]+/g) || [];
  return codes
    .map(c => DIET_MAP[c.toLowerCase()])
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) as string[];
}

// Common day-header patterns: "Maanantai", "MA:", "Ma 11.5.", "Maanantai 11.5."
const DAY_FULL = ['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai'];
const DAY_SHORT = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su'];

// Returns 0-6 (mon-sun) if the text starts with a day token; else null.
export function matchDayIndex(text: string): number | null {
  const t = text.trim().toLowerCase();
  for (let i = 0; i < DAY_FULL.length; i++) {
    if (t.startsWith(DAY_FULL[i])) return i;
  }
  // short form must be followed by ':' or space+digit or end
  for (let i = 0; i < DAY_SHORT.length; i++) {
    const re = new RegExp(`^${DAY_SHORT[i]}(?::|\\s+\\d|\\s*$)`);
    if (re.test(t)) return i;
  }
  return null;
}

export function getTodayDayIndex(): number {
  // 0=mon..6=sun
  const js = new Date().getDay(); // 0=sun
  return (js + 6) % 7;
}

export function emptyMenu(source: string, error?: string): RestaurantMenu {
  return {
    date: new Date().toISOString().split('T')[0],
    items: [],
    source,
    error,
  };
}
