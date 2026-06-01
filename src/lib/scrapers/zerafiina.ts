import { scrapeLounastajaWeek } from './lounastaja';
import { RestaurantMenu } from './utils';

const WIDGET_ID = 'dQYkRdvS2G7xd7DTWP1p';
const API_KEY = '0cb91d2b-ad4f-4118-b1c6-2146912ca431';
const SOURCE = 'https://zerafiina.fi/viikkolounas-kangasala/';

export async function scrapeZerafiina(): Promise<RestaurantMenu> {
  return scrapeLounastajaWeek(WIDGET_ID, API_KEY, SOURCE);
}
