import axios from 'axios';
import * as cheerio from 'cheerio';
import { RestaurantMenu, MenuItem } from './utils';

const URL = 'https://antell.fi/lounas/helsinki/femma/';

// Antell's lunch tabs are panels with ids like `panel-Monday`, `panel-Tuesday`, ...
const PANEL_BY_WEEKDAY: Record<number, string> = {
  1: 'panel-Monday',
  2: 'panel-Tuesday',
  3: 'panel-Wednesday',
  4: 'panel-Thursday',
  5: 'panel-Friday'
};

// Antell uses short codes: G = gluteeniton, L = laktoositon, M = maidoton,
// VL = vähälaktoosinen, VEG = vegaaninen, A = sisältää allergeeneja (skip).
const DIET_CODE_MAP: Record<string, string> = {
  g: 'gluteeniton',
  l: 'laktoositon',
  m: 'maidoton',
  vl: 'vähälaktoosinen',
  veg: 'vegaaninen',
  v: 'vegaaninen'
};

function parseAntellDiets(codesText: string): string[] {
  if (!codesText) return [];
  const codes = codesText
    .toLowerCase()
    .split(/[,\s\/]+/)
    .map(c => c.trim())
    .filter(Boolean);

  const diets = codes
    .map(c => DIET_CODE_MAP[c])
    .filter(Boolean) as string[];

  return Array.from(new Set(diets));
}

export async function scrapeAntell(): Promise<RestaurantMenu> {
  try {
    const dayOfWeek = new Date().getDay();
    const panelId = PANEL_BY_WEEKDAY[dayOfWeek];
    if (!panelId) {
      return {
        date: new Date().toISOString().split('T')[0],
        items: [],
        source: URL
      };
    }

    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const panel = $(`#${panelId}`);
    if (!panel.length) throw new Error(`Antell: paneelia ${panelId} ei löytynyt`);

    const items: MenuItem[] = [];
    const seen = new Set<string>();

    panel.find('.accordion').each((_, acc) => {
      const $acc = $(acc);
      // Only top-level item accordions (have a header button); skip nested tooltip accordions.
      const button = $acc.children('.accordion__button').first();
      if (!button.length) return;

      const rawName = button.text().trim().replace(/\s+/g, ' ');
      if (!rawName || rawName.length < 3) return;
      if (seen.has(rawName)) return;
      seen.add(rawName);

      // Diet codes live in a sibling footer inside the same `<li>` wrapper as
      // the accordion (footer is not a descendant of the accordion itself).
      const dietText = $acc.parent().find('.accordion__footer__special-diets').first().text().trim();
      const diets = parseAntellDiets(dietText);

      items.push({ name: rawName, diets });
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: URL
    };
  } catch (error: any) {
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: URL,
      error: error.message
    };
  }
}
