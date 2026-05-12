import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, getTodayDayIndex, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://www.popino.fi/lounas/';
const DAY_PREFIXES = ['MA:', 'TI:', 'KE:', 'TO:', 'PE:', 'LA:', 'SU:'];

export async function scrapePopino(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const today = getTodayDayIndex();
    const todayPrefix = DAY_PREFIXES[today];
    const items: MenuItem[] = [];

    $('.b-text-c p').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text) return;
      const upper = text.toUpperCase();
      if (!upper.startsWith(todayPrefix)) return;
      const dish = text.substring(todayPrefix.length).trim();
      if (dish.length < 3) return;
      if (/^helatorstai|^ei lounasta|^suljettu/i.test(dish)) return;
      const parsed = extractItem(dish);
      if (parsed) items.push(parsed);
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
