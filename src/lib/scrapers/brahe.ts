import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, getTodayDayIndex, matchDayIndex, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://braheravintolat.fi/';

export async function scrapeBrahe(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const today = getTodayDayIndex();
    const items: MenuItem[] = [];

    $('.brahe-menu-item').each((_, el) => {
      const dayLabel = $(el).find('.item-title h3').first().text().trim();
      const idx = matchDayIndex(dayLabel);
      if (idx !== today) return;

      $(el).find('.row-item').each((_, row) => {
        const title = $(row).find('.row-title').text().replace(/\s+/g, ' ').trim();
        const price = $(row).find('.row-price').text().replace(/\s+/g, ' ').trim();
        if (!title) return;
        const parsed = extractItem(title);
        if (!parsed) return;
        items.push({
          name: price ? `${parsed.name} — ${price}` : parsed.name,
          diets: parsed.diets,
        });
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
