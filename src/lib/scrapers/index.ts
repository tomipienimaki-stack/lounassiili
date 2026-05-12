import { scrapeHalo } from './halo';
import { scrapeAntell } from './antell';
import { scrapePopino } from './popino';
import { scrapeUoma } from './uoma';

import { scrapeLounasMesta } from './lounasmesta';
import { scrapeMillers } from './millers';
import { scrapeLounaskulma } from './lounaskulma';
import { scrapeBrahe } from './brahe';
import { scrapeSeiska } from './seiska';
import { scrapeHimalaya } from './himalaya';
import { scrapePazzi } from './pazzi';
import { scrapeZerafiina } from './zerafiina';
import { scrapeJumbowl } from './jumbowl';
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
  himalaya: scrapeHimalaya,
  pazzi: scrapePazzi,
  zerafiina: scrapeZerafiina,
  jumbowl: scrapeJumbowl,
};

export async function fetchAllMenus() {
  const entries = await Promise.all(
    Object.entries(scrapers).map(async ([id, scraper]) => {
      try {
        return [id, await scraper()] as const;
      } catch (err) {
        return [id, {
          date: new Date().toISOString().split('T')[0],
          items: [],
          source: '',
          error: (err as Error).message,
        }] as const;
      }
    })
  );
  return Object.fromEntries(entries) as Record<string, RestaurantMenu>;
}
