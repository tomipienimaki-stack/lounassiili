import { scrapeHalo } from './halo';
import { scrapeAntell } from './antell';
import { scrapePantry } from './pantry';
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
import { scrapeMyllytupa } from './myllytupa';
import { scrapeBora } from './bora';
import { RestaurantMenu } from './utils';

export const scrapers: Record<string, () => Promise<RestaurantMenu>> = {
  halo: scrapeHalo,
  antell: scrapeAntell,
  pantry: scrapePantry,
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
  myllytupa: scrapeMyllytupa,
  bora: scrapeBora,
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
