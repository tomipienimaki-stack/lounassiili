import { scrapeHalo } from './halo';
import { scrapeAntell } from './antell';
import { scrapePopino } from './popino';
import { scrapeBrahe } from './brahe';
import { scrapeUoma } from './uoma';
import { scrapeHimalaya } from './himalaya';
import { scrapeLounaskulma } from './lounaskulma';
import { scrapeSeiska } from './seiska';
import { RestaurantMenu } from './utils';

export const scrapers: Record<string, () => Promise<RestaurantMenu>> = {
  halo: scrapeHalo,
  antell: scrapeAntell,
  popino: scrapePopino,
  brahe: scrapeBrahe,
  uoma: scrapeUoma,
  himalaya: scrapeHimalaya,
  lounaskulma: scrapeLounaskulma,
  seiska: scrapeSeiska,
};

export async function fetchAllMenus() {
  const results: Record<string, RestaurantMenu> = {};
  for (const [id, scraper] of Object.entries(scrapers)) {
    try {
      results[id] = await scraper();
    } catch (e: any) {
      results[id] = {
        date: new Date().toISOString().split('T')[0],
        items: [],
        source: '',
        error: e.message
      };
    }
  }
  return results;
}
