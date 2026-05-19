import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayCaps, RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.popino.fi/lounas/';
const DAY_PREFIXES = ['MA:', 'TI:', 'KE:', 'TO:', 'PE:', 'LA:', 'SU:'];
const PRICE_RE = /^\d{1,3}[,.]\d{2}\s*€?$/;

/**
 * Popino has two sections per day:
 *   1) a daily-rotating block ("MA: ...", "TI: ...", ...) - we pick today's row
 *   2) weekly always-available dishes (Pizza, Wok, Pippuripihvi, ...) each
 *      followed by a separate price paragraph.
 * Both should appear in today's lunch list.
 */
export async function scrapePopino(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayPrefix = `${getTodayDayCaps()}:`;
    const items: MenuItem[] = [];

    // Collect lunch paragraphs in document order
    const paragraphs: string[] = [];
    $('.b-text-c p').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text) paragraphs.push(text);
    });

    // 1) daily rotating: find paragraph starting with today's caps prefix
    for (const text of paragraphs) {
      const upper = text.toUpperCase();
      if (upper.startsWith(todayPrefix)) {
        const dish = text.substring(todayPrefix.length).trim();
        if (dish.length > 2) items.push({ name: dish, diets: [] });
        break;
      }
    }

    // 2) always-available weekly dishes: paragraphs after the daily block that
    //    aren't day-prefixed and aren't prices. They alternate dish/price.
    for (const text of paragraphs) {
      const upper = text.toUpperCase();
      if (DAY_PREFIXES.some(p => upper.startsWith(p))) continue;
      if (PRICE_RE.test(text)) continue;
      if (text.length < 5) continue;
      // Skip the buffet meta lines like "LOUNAS MA-PE KLO 11-14"
      if (/^LOUNAS\b/i.test(text) && /KLO/i.test(text)) continue;

      // dedupe
      if (items.some(i => i.name.toUpperCase() === upper)) continue;
      items.push({ name: text, diets: [] });
    }

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
