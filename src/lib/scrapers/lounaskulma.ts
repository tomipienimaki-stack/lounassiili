import axios from 'axios';
import * as cheerio from 'cheerio';
import { RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.maaritinlounaskulma.fi/';

export async function scrapeLounaskulma(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const items: MenuItem[] = [];

    // Maaritin Lounaskulma often lists the menu in a specific section
    // We'll look for day names and capture the items
    const content = $('#main-content').text() || $('.entry-content').text() || $('body').text();
    
    if (content) {
      const today = new Date().toLocaleDateString('fi-FI', { weekday: 'long' });
      const todayFull = today.charAt(0).toUpperCase() + today.slice(1);
      
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 3);
      let capturing = false;
      for (const line of lines) {
        if (line.includes(todayFull)) {
          capturing = true;
          continue;
        }
        if (capturing && (line.includes('Maanantai') || line.includes('Tiistai') || line.includes('Keskiviikko') || line.includes('Torstai') || line.includes('Perjantai'))) {
          capturing = false;
          break;
        }
        if (capturing && !line.includes('Lounas') && !line.includes('klo')) {
          items.push({ name: line, diets: [] });
        }
      }
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
