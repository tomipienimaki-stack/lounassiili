import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, getTodayDayIndex, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://www.ninankeittio.fi/kangasala-lounaskievari/';

const DAY_SHORT: Record<string, string> = {
  MAANANTAI: 'MA',
  TIISTAI: 'TI',
  KESKIVIIKKO: 'KE',
  TORSTAI: 'TO',
  PERJANTAI: 'PE',
};

// 0=mon..6=sun, mapped to short labels
const SHORT_BY_INDEX = ['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU'];

// Strips trailing prices like " 13,20€" or " 9,90€"
function stripTrailingPrice(text: string): string {
  return text.replace(/\s*\d+[,.]\d+\s*€\s*$/i, '').trim();
}

export async function scrapeNinanKeittio(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const items: MenuItem[] = [];
    let currentDay: string | null = null;
    const todayShort = SHORT_BY_INDEX[getTodayDayIndex()];

    // Walk all <b> day headers and <li> dish items in document order
    $('b, li').each((_, el) => {
      const tag = el.tagName;
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (tag === 'b') {
        const m = text.match(/^(MAANANTAI|TIISTAI|KESKIVIIKKO|TORSTAI|PERJANTAI)\b/i);
        if (m) currentDay = DAY_SHORT[m[1].toUpperCase()] ?? null;
        return;
      }
      if (!currentDay) return;
      const cleanLine = stripTrailingPrice(text);
      const parsed = extractItem(cleanLine);
      if (!parsed || parsed.name.length < 3) return;
      items.push({
        name: `${currentDay} – ${parsed.name}`,
        diets: parsed.diets,
        today: currentDay === todayShort,
      });
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: URL,
    };
  } catch (error: unknown) {
    return emptyMenu(URL, (error as Error).message);
  }
}
