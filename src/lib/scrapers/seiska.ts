import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.ravintolaseiska.fi/lounaslista';

export async function scrapeSeiska(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayName = getTodayDayName();
    const items: MenuItem[] = [];

    $('.lounas-lista-day').each((_, el) => {
        const day = $(el).find('.day-name').text().trim().toLowerCase();
        if (day.includes(todayName)) {
            $(el).find('.lounas-item').each((_, item) => {
                const name = $(item).find('.item-name').text().trim();
                if (name) items.push({ name, diets: [] });
            });
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
