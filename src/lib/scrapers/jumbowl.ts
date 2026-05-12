import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://jumbowl.fi/en/menu';

// Jumbowl is à la carte (Chinese noodle house). We surface the featured noodle
// dishes that are most lunch-relevant. Each dish is in an <h3> like:
//   "Lanzhou Ramen(L,K)"
export async function scrapeJumbowl(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const items: MenuItem[] = [];

    $('h3.display-serif').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text) return;
      // Skip FAQ-style headings on the page
      if (/options\??$|vegan|gluten/i.test(text)) return;
      const parsed = extractItem(text);
      if (parsed && parsed.name.length > 2) items.push(parsed);
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items: items.slice(0, 8),
      source: URL,
    };
  } catch (error: unknown) {
    return emptyMenu(URL, (error as Error).message);
  }
}
