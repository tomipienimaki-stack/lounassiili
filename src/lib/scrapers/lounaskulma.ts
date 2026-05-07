import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.lounaskulma.fi/lounaslista';

export async function scrapeLounaskulma(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayName = getTodayDayName();
    const items: MenuItem[] = [];

    $('.entry-content p, .entry-content h3').each((_, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (text.includes(todayName)) {
            let next = $(el).next();
            while (next.length && !next.text().toLowerCase().includes('maanantai') && !next.text().toLowerCase().includes('tiistai')) {
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
