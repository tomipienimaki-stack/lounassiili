import { scrapeHalo } from './halo';
import { scrapeAntell } from './antell';
import { scrapePopino } from './popino';
import { RestaurantMenu } from './utils';

export const scrapers: Record<string, () => Promise<RestaurantMenu>> = {
  halo: scrapeHalo,
  antell: scrapeAntell,
  popino: scrapePopino,
};

export async function fetchAllMenus() {
  const results: Record<string, RestaurantMenu> = {};
  for (const [id, scraper] of Object.entries(scrapers)) {
    results[id] = await scraper();
  }
  return results;
}
