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

export function getTodayDayName() {
  return DAYS_FI[new Date().getDay()];
}

export interface MenuItem {
  name: string;
  diets: string[];
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
