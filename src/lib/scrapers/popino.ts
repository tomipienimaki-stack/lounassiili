import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, RestaurantMenu, MenuItem, DAYS_FI } from './utils';

const URL = 'https://www.popino.fi/lounas/';

export async function scrapePopino(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayName = getTodayDayName();
    const items: MenuItem[] = [];

    // Popinon sivulla lounas on yleensä h3- tai strong-otsikoiden alla
    $('.wpb_wrapper p, .wpb_wrapper h3').each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      
      if (text.startsWith(todayName)) {
        let nextElement = $(el).next();
        while (nextElement.length && !DAYS_FI.some(d => nextElement.text().toLowerCase().startsWith(d))) {
          const dishText = nextElement.text().trim();
          
          if (dishText.length > 5) {
            const name = dishText.split(/[0-9]/)[0].trim(); 
            items.push({ 
              name: name, 
              diets: [] 
            });
          }
          nextElement = nextElement.next();
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
