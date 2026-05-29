import { scrapeFromLounaatInfo } from './lounaat-info';

const URL = 'https://www.lounaat.info/lounas/pompier/helsinki';

export async function scrapePompier() {
  return scrapeFromLounaatInfo(URL);
}
