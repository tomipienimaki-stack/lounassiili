import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, getTodayDayIndex, matchDayIndex, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://lounasmesta.fi/lounaslista/';

// WordPress block layout: <h3>Tiistai </h3> followed by <p><strong>dish</strong></p>
// until the next <h3>.
export async function scrapeLounasMesta(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const today = getTodayDayIndex();
    const items: MenuItem[] = [];

    const nodes = $('h3, p').toArray();
    let capturing = false;
    let stop = false;

    for (const node of nodes) {
      if (stop) break;
      const tag = ($(node).prop('tagName') || '').toLowerCase();
      const text = $(node).text().replace(/\s+/g, ' ').trim();
      if (!text) continue;

      if (tag === 'h3') {
        const idx = matchDayIndex(text);
        if (idx !== null) {
          if (capturing) {
            stop = true;
            break;
          }
          capturing = idx === today;
        }
        continue;
      }

      if (capturing) {
        if (/^(aikuiset|lapset|p[öo]yt[äa]varauksia|yhteystiedot|oiva-raportti|äitienp|klo\b|tervetuloa)/i.test(text)) continue;
        const parsed = extractItem(text);
        if (parsed && parsed.name.length > 3) items.push(parsed);
      }
    }

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: URL,
    };
  } catch (error: unknown) {
    return emptyMenu(URL, (error as Error).message);
  }
}
