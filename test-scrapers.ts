
import { scrapers } from './src/lib/scrapers/index';

async function testScrapers() {
  const hameenlinnaIds = ['popino', 'uoma', 'himalaya', 'lounasmesta', 'brahe', 'seiska', 'miller', 'lounaskulma'];
  
  for (const id of hameenlinnaIds) {
    console.log(`Testing scraper: ${id}...`);
    try {
      const result = await scrapers[id]();
      console.log(`Result for ${id}:`, JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(`Error testing ${id}:`, err);
    }
  }
}

testScrapers();
