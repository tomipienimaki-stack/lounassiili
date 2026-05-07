import axios from 'axios';
import * as cheerio from 'cheerio';
import { RestaurantMenu, MenuItem } from './utils';

const API_URL = 'https://www.antell.fi/wp-json/wp/v2/pages?slug=antell-femma&_fields=content';

export async function scrapeAntell(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const page = response.data[0];
    if (!page) throw new Error('Antell: lounassivu ei löytynyt');

    const $ = cheerio.load(page.content.rendered);
    const items: MenuItem[] = [];

    // Antell has a table for the daily menu
    // We look for the current day's section. Antell's structure varies but often has day names in headers.
    const today = new Date().toLocaleDateString('fi-FI', { weekday: 'long' }).toLowerCase();
    
    // Simplification: Antell often has a "Päivän lounas" table or list
    $('.lunch-menu-item').each((_, el) => {
        const name = $(el).find('.menu-item-name').text().trim();
        const diets = $(el).find('.menu-item-diets').text().trim().split(',').map(d => d.trim()).filter(Boolean);
        if (name) items.push({ name, diets });
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: 'https://www.antell.fi/ravintolat/antell-femma'
    };
  } catch (error: any) {
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: 'https://www.antell.fi/ravintolat/antell-femma',
      error: error.message
    };
  }
}
