import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.ravintolauoma.fi/';

export async function scrapeUoma(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayName = getTodayDayName();
    const items: MenuItem[] = [];

    // Uoma uses an Opiferum widget or simple paragraphs
    // Based on subagent findings, the menu is often in <div> or <p> tags with day names
    $('div, p, strong').each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text === todayName || text.startsWith(todayName)) {
        let next = $(el).next();
        // Get following items until next day or empty
        while (next.length && next.text().trim().length > 0) {
            const itemText = next.text().trim();
            if (itemText.length > 5) {
                items.push({ name: itemText, diets: [] });
            }
            next = next.next();
        }
      }
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
