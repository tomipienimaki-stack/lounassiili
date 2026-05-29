import { scrapeFromLounaatInfo } from './lounaat-info';

const URL = 'https://www.lounaat.info/lounas/sandro-kortteli/helsinki';

export async function scrapeSandro() {
  return scrapeFromLounaatInfo(URL);
}
