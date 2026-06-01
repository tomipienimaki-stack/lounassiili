import { scrapeLounastajaWeek } from './lounastaja';
import { RestaurantMenu } from './utils';

const WIDGET_ID = 'aeMy9X2EOid1UjZp5rha';
const API_KEY = '4b7a6d09-96a4-46c5-9cd3-f55b70d8773c';
const SOURCE = 'https://makumaestro.fi/#lounas';

export async function scrapeMakuMaestro(): Promise<RestaurantMenu> {
  return scrapeLounastajaWeek(WIDGET_ID, API_KEY, SOURCE);
}
