import { scrapeHalo } from './halo';
import { scrapeAntell } from './antell';
import { scrapePopino } from './popino';
import { scrapeUoma } from './uoma';

import { scrapeLounasMesta } from './lounasmesta';
import { scrapeMillers } from './millers';
import { scrapeLounaskulma } from './lounaskulma';
import { scrapeBrahe } from './brahe';
import { scrapeSeiska } from './seiska';
import { RestaurantMenu } from './utils';

export const scrapers: Record<string, () => Promise<RestaurantMenu>> = {
  halo: scrapeHalo,
  antell: scrapeAntell,
  popino: scrapePopino,
  uoma: scrapeUoma,

  lounasmesta: scrapeLounasMesta,
  miller: scrapeMillers,
  lounaskulma: scrapeLounaskulma,
  brahe: scrapeBrahe,
  seiska: scrapeSeiska,
};

export async function fetchAllMenus() {
  const results: Record<string, RestaurantMenu> = {};
  for (const [id, scraper] of Object.entries(scrapers)) {
    results[id] = await scraper();
  }
  return results;
}
