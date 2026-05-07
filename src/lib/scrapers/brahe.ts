import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, RestaurantMenu, MenuItem, DAYS_FI } from './utils';

const URL = 'https://braheravintolat.fi/';

export async function scrapeBrahe(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayName = getTodayDayName();
    const items: MenuItem[] = [];

    $('.brahe-menu-item').each((_, el) => {
      const dayHeader = $(el).find('.item-title h3').text().trim().toLowerCase();
      
      if (dayHeader.includes(todayName)) {
        $(el).find('.row-item').each((_, row) => {
          const name = $(row).find('.row-title').text().trim();
          const price = $(row).find('.row-price').text().trim();
          
          if (name) {
            // Clean up name (remove diets in parens for now if needed, but let's keep them)
            items.push({ 
              name: price ? `${name} — ${price}` : name, 
              diets: [] // We could parse these from (L, G) etc.
            });
          }
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
