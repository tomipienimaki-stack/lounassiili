import { scrapeFromLounaatInfo } from './lounaat-info';

const URL = 'https://www.lounaat.info/lounas/lounaskahvila-zerafiina/kangasala';

export async function scrapeZerafiina() {
  return scrapeFromLounaatInfo(URL);
}
