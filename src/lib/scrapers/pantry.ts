import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, RestaurantMenu, MenuItem, DAYS_FI } from './utils';

const URL = 'https://thepantry.fi/ruoholahti/';
const SOURCE = 'https://www.lounaat.info/lounas/the-pantry/helsinki';

const DIET_CODE_MAP: Record<string, string> = {
  g: 'gluteeniton',
  l: 'laktoositon',
  m: 'maidoton',
  vl: 'vähälaktoosinen',
  veg: 'vegaaninen',
  v: 'vegaaninen'
};

// Strip "(L, G, pyydettäessä Veg)" -> diets + clean name.
function extractDietsAndName(raw: string): { name: string; diets: string[] } {
  const parenMatches = raw.match(/\(([^)]+)\)/g) || [];
  const diets: string[] = [];

  for (const m of parenMatches) {
    const inner = m.slice(1, -1);
    const codes = inner.split(/[\s,/]+/).map(c => c.trim().toLowerCase()).filter(Boolean);
    for (const c of codes) {
      const mapped = DIET_CODE_MAP[c];
      if (mapped) diets.push(mapped);
    }
  }

  const name = raw.replace(/\s*\([^)]+\)/g, '').trim().replace(/\s+/g, ' ');
  return { name, diets: Array.from(new Set(diets)) };
}

export async function scrapePantry(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const today = getTodayDayName(); // e.g. "tiistai"
    const items: MenuItem[] = [];

    // .au-content blocks are flat siblings, each containing a day h3,
    // a category h4 (PÄIVÄN KASVIS/KALA/LIHA), or a dish paragraph.
    const blocks = $('.au-content').toArray();
    let inToday = false;

    for (const el of blocks) {
      const $el = $(el);
      const h3 = $el.find('h3').first();

      if (h3.length) {
        const heading = h3.text().trim().toLowerCase();
        // Day heading looks like "TIISTAI 19.5.2026"
        const matchedDay = DAYS_FI.find(d => heading.startsWith(d));
        if (matchedDay) {
          inToday = matchedDay === today;
          continue;
        }
        // Other h3 (e.g. Aukioloajat, Seuraa meitä) -> stop capturing.
        inToday = false;
        continue;
      }

      if (!inToday) continue;

      // Skip category h4 blocks ("PÄIVÄN KASVIS")
      const h4 = $el.find('h4').first();
      if (h4.length && !$el.find('p').length) continue;

      // Dish name is the first <strong> in the block.
      const strong = $el.find('strong').first();
      if (!strong.length) continue;

      const rawName = strong.text().trim().replace(/\s+/g, ' ');
      if (!rawName || rawName.length < 3) continue;

      const { name, diets } = extractDietsAndName(rawName);
      if (!name) continue;
      if (items.some(i => i.name === name)) continue;
      items.push({ name, diets });
    }

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: SOURCE
    };
  } catch (error: any) {
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: SOURCE,
      error: error.message
    };
  }
}
