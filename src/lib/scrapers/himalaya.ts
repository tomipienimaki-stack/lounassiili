import axios from 'axios';
import { RestaurantMenu, MenuItem } from './utils';

// Himalaya Kitchen uses RestaDeal API or embedded widget
const API_URL = 'https://restadeal.fi/api/v1/restaurants/himalaya-kitchen/menu'; 

export async function scrapeHimalaya(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const data = response.data;
    const items: MenuItem[] = [];

    if (data && data.menus) {
        // Find today's menu in RestaDeal JSON
        const todayStr = new Date().toISOString().split('T')[0];
        const todayMenu = data.menus.find((m: any) => m.date === todayStr);
        
        if (todayMenu && todayMenu.items) {
            todayMenu.items.forEach((item: any) => {
                items.push({ 
                    name: item.name_fi || item.name, 
                    diets: item.diets || [] 
                });
            });
        }
    }

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: 'https://himalayakitchen.fi/'
    };
  } catch (error: any) {
    // Fallback or error
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: 'https://himalayakitchen.fi/',
      error: error.message
    };
  }
}
