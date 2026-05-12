import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, getTodayDayIndex, matchDayIndex, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://www.ravintolaseiska.com/lounas';

// Seiska is on Wix. Each day is an <h5> like "Tiistai 12.5.", followed by
// <p> rows with the dishes until the next <h5>.
export async function scrapeSeiska(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const today = getTodayDayIndex();
    const items: MenuItem[] = [];

    // Find the container that holds the day h5s + dish ps in a flat sequence.
    // Easiest: walk all h5 and p in document order globally.
    const nodes = $('h5, p').toArray();
    let capturing = false;
    let stop = false;

    for (const node of nodes) {
      if (stop) break;
      const tag = ($(node).prop('tagName') || '').toLowerCase();
      const text = $(node).text().replace(/\s+/g, ' ').trim();
      if (!text) continue;

      if (tag === 'h5') {
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
        // skip section markers and pricing footer
        if (/^(LOUNAS|Hinnat|Avoinna|Lounas\s+\d|KAHVI|Lounaan)/i.test(text)) continue;
        if (text.toLowerCase().includes('kiinni')) continue;
        if (/^\d{1,2}[,.]\d{0,2}\s*€/.test(text)) continue;
        // A single <p> sometimes contains two dishes glued together, e.g.
        // "Karjalanpaisti M, G Muusi L, G". Split on diet-codes boundary
        // followed by a new capitalized word.
        const segments = text.split(/(?<=\s[A-Z](?:,\s*[A-Z]){0,3})\s+(?=[A-ZÄÖÅ][a-zäöå])/);
        for (const seg of segments) {
          const parsed = extractItem(seg.trim());
          if (parsed && parsed.name.length > 2) items.push(parsed);
        }
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
