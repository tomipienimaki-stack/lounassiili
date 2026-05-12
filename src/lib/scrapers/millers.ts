import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://millersbbq.fi/menu/';

// Miller's BBQ has a fixed à la carte BBQ menu (no rotating daily lunch).
// Extract the combo offerings under "FIRST COME, FIRST SERVED" — they pair
// name + price in consecutive <h4> tags inside the same row.
export async function scrapeMillers(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const items: MenuItem[] = [];

    const headings = $('h4').toArray();
    for (let i = 0; i < headings.length - 1; i++) {
      const name = $(headings[i]).text().replace(/\s+/g, ' ').trim();
      const next = $(headings[i + 1]).text().replace(/\s+/g, ' ').trim();
      // Combo rows: name (uppercase letters and digits) + price-only sibling
      if (/^[A-ZÄÖÅ0-9].{2,60}$/.test(name) && /^\d{1,3}[,.]?\d{0,2}\s*€$/.test(next)) {
        items.push({ name: `${name} — ${next}`, diets: [] });
        i++; // consume price
      }
    }

    // Keep the list short and useful; first 6 combos are the lunch-relevant ones.
    const trimmed = items.slice(0, 6);

    return {
      date: new Date().toISOString().split('T')[0],
      items: trimmed,
      source: URL,
    };
  } catch (error: unknown) {
    return emptyMenu(URL, (error as Error).message);
  }
}
