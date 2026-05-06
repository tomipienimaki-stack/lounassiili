const express = require('express');
const path = require('path');
const cron = require('node-cron');
const scrapers = require('./scrapers');

const app = express();
const PORT = process.env.PORT || 3000;

// Välimuisti lounaslistoille
let menuCache = {
  lastUpdated: null,
  menus: []
};

// ── Ruoholahti ───────────────────────────────────────────────────────────────

const ruoholahtiRestaurants = [
  // Vyöhyke 1: Vieressä (0–300 m)
  {
    id: 'halo',
    name: 'HALO Food & Events',
    address: 'Ruoholahdenkatu 21',
    distance: '0m (samassa talossa!)',
    price: '~14€',
    hours: 'ma-pe 11:00-13:30',
    url: 'https://halorestaurant.fi',
    zone: 1,
    zoneLabel: 'Vieressä (0–300 m)'
  },
  {
    id: 'halikarnas',
    name: 'Ravintola Halikarnas',
    address: 'Ruoholahdenkatu 19',
    distance: '~100m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJ-_fGZjUKkkYRdLAert8uAKQ',
    zone: 1,
    zoneLabel: 'Vieressä (0–300 m)',
    fixedMenu: true,
    fixedMenuNote: 'Turkkilainen lounasbuffet — sama lista joka päivä'
  },
  {
    id: 'gresa',
    name: 'Ravintola Gresa',
    address: 'Ruoholahdenkatu',
    distance: '~200m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJSxb-sxkLkkYRfWnUEJjBYG0',
    zone: 1,
    zoneLabel: 'Vieressä (0–300 m)'
  },
  {
    id: 'oasis',
    name: 'Oasis Ruoholahti',
    address: 'Ruoholahdenkatu',
    distance: '~200m',
    price: '~12€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJw0yXakMLkkYRv_u1_L-f0e0',
    zone: 1,
    zoneLabel: 'Vieressä (0–300 m)'
  },
  {
    id: 'pantry',
    name: 'The Pantry Ruoholahti',
    address: 'Ruoholahdenkatu',
    distance: '~200m',
    price: '~12€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJ036FokELkkYRuix6Y-w8mEg',
    zone: 1,
    zoneLabel: 'Vieressä (0–300 m)'
  },
  {
    id: 'antell',
    name: 'Antell Femma',
    address: 'Itämerenkatu 5',
    distance: '~300m',
    price: '~13€',
    hours: 'ma-pe 11:00-13:30',
    url: 'https://www.antell.fi/ravintolat/antell-femma',
    zone: 1,
    zoneLabel: 'Vieressä (0–300 m)'
  },

  // Vyöhyke 2: Ruoholahden sydämessä (300–500 m)
  {
    id: 'sewa',
    name: 'Ravintola Sewa',
    address: 'Itämerenkatu',
    distance: '~350m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJLbo2MpkLkkYRLSHDvcEimPA',
    zone: 2,
    zoneLabel: 'Ruoholahden sydämessä (300–500 m)'
  },
  {
    id: 'dif',
    name: 'DIF Döner',
    address: 'Ruoholahti',
    distance: '~400m',
    price: '~12€',
    hours: 'ma-pe 10:30-20:00',
    url: 'https://www.google.com/search?q=place_id://ChIJTz2C7Z8LkkYRSvS8T2kG-G8',
    fixedMenu: true,
    fixedMenuNote: 'Döner-menu — sama lista joka päivä',
    zone: 2,
    zoneLabel: 'Ruoholahden sydämessä (300–500 m)'
  },
  {
    id: 'dylan',
    name: 'Dylan Raspberry',
    address: 'Ruoholahti',
    distance: '~400m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJI-S8E58LkkYRa3W59F9Kj9U',
    zone: 2,
    zoneLabel: 'Ruoholahden sydämessä (300–500 m)'
  },
  {
    id: 'roihu',
    name: 'Ravintola Roihu',
    address: 'Ruoholahti',
    distance: '~450m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJzWpY6p8LkkYRLv2oN8LOfyY',
    zone: 2,
    zoneLabel: 'Ruoholahden sydämessä (300–500 m)'
  },
  {
    id: 'foodco',
    name: 'Food & Co Ruoholahti',
    address: 'Porkkalankatu',
    distance: '~450m',
    price: '~13€',
    hours: 'ma-pe 11:00-13:30',
    url: 'https://www.google.com/search?q=place_id://ChIJeZc_mJ4LkkYRqR2zLOnpZRA',
    zone: 2,
    zoneLabel: 'Ruoholahden sydämessä (300–500 m)'
  },

  // Vyöhyke 3: Matkalla keskustaan (550–800 m)
  {
    id: 'uyghur',
    name: 'Uyghur Noodle House Kamppi',
    address: 'Kamppi',
    distance: '~700m',
    price: '~12€',
    hours: 'ma-pe 11:00-20:00',
    url: 'https://www.google.com/search?q=place_id://ChIJf0TJ2qsLkkYRTGKkmsuBk4Y',
    zone: 3,
    zoneLabel: 'Matkalla keskustaan (550–800 m)'
  },
  {
    id: 'prettyboy',
    name: 'Pretty Boy Kamppi',
    address: 'Kamppi',
    distance: '~750m',
    price: '~14€',
    hours: 'ma-pe 11:00-15:00',
    url: 'https://www.google.com/search?q=place_id://ChIJdz28zD4LkkYRtBbulcqnuqM',
    zone: 3,
    zoneLabel: 'Matkalla keskustaan (550–800 m)'
  },

  // Vyöhyke 4: Hietalahden kauppahalli (500–600 m)
  {
    id: 'chaophraya',
    name: 'Chao Phraya',
    address: 'Hietalahden kauppahalli',
    distance: '~550m',
    price: '~12€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJz-8CD2cLkkYRnuGPNcgiz_Q',
    zone: 4,
    zoneLabel: 'Hietalahden kauppahalli (500–600 m)'
  },
  {
    id: 'houseofsalmon',
    name: 'House of Salmon',
    address: 'Hietalahden kauppahalli',
    distance: '~550m',
    price: '~15€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJ8XPFfEsLkkYR0rCPU4EKdc8',
    zone: 4,
    zoneLabel: 'Hietalahden kauppahalli (500–600 m)'
  },
  {
    id: 'superbowl',
    name: 'Ravintola Super Bowl',
    address: 'Hietalahden kauppahalli',
    distance: '~550m',
    price: '~12€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJZ6rc-qQLkkYRS6_wy0xoAWQ',
    zone: 4,
    zoneLabel: 'Hietalahden kauppahalli (500–600 m)'
  },
  {
    id: 'mamaspho',
    name: "Ravintola Mama's Phở",
    address: 'Hietalahden kauppahalli',
    distance: '~550m',
    price: '~12€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJiz0xbJ8LkkYR-sC2SCfVJGc',
    zone: 4,
    zoneLabel: 'Hietalahden kauppahalli (500–600 m)'
  },
  {
    id: 'tokyostreet',
    name: 'Tokyo Street',
    address: 'Hietalahden kauppahalli',
    distance: '~550m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJ4wsbRbULkkYRYhgWqIbzsmc',
    zone: 4,
    zoneLabel: 'Hietalahden kauppahalli (500–600 m)'
  },
  {
    id: 'fatramen',
    name: 'Fat Ramen',
    address: 'Hietalahden kauppahalli',
    distance: '~550m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJ4wsbRbULkkYRld2SBsPBlzI',
    zone: 4,
    zoneLabel: 'Hietalahden kauppahalli (500–600 m)'
  },
  {
    id: 'izza',
    name: 'IZZA Hietsun halli',
    address: 'Hietalahden kauppahalli',
    distance: '~550m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.google.com/search?q=place_id://ChIJGVHx2-kJkkYRbVh9w3z9Euw',
    zone: 4,
    zoneLabel: 'Hietalahden kauppahalli (500–600 m)'
  }
];

// ── Kangasala ─────────────────────────────────────────────────────────────────

const kangasalaRestaurants = [
  {
    id: 'pazzi',
    name: 'Trattoria Pazzi',
    address: 'Kangasala',
    distance: '',
    price: '~13,50€',
    hours: 'ma-pe 10:30-15:00',
    url: 'https://www.pazzi.fi/lounas/',
    zone: 1,
    zoneLabel: 'Kangasalan lounaspaikat'
  },
  {
    id: 'zerafiina',
    name: 'Lounaskahvila Zerafiina',
    address: 'Kangasala',
    distance: '',
    price: '~13,30€',
    hours: 'ma-pe 10:30-14:00',
    url: 'https://zerafiina.fi/viikkolounas-kangasala/',
    zone: 1,
    zoneLabel: 'Kangasalan lounaspaikat'
  },
  {
    id: 'pepper',
    name: 'Pepper Bar & Restaurant',
    address: 'Kangasala',
    distance: '',
    price: '~13€',
    hours: 'ti-pe 11:00-14:00',
    url: 'https://pepper.fi/lounas-kangasala/',
    zone: 1,
    zoneLabel: 'Kangasalan lounaspaikat'
  },
  {
    id: 'jalmari',
    name: 'Kulttuuriravintola Jalmari',
    address: 'Kangasalan talo',
    distance: '',
    price: '~12,90€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://kangasala-talo.fi/ravintola/lounaslista/',
    zone: 1,
    zoneLabel: 'Kangasalan lounaspaikat'
  },
  {
    id: 'paakari',
    name: 'Ravintola Paakari',
    address: 'Kangasala',
    distance: '',
    price: '~14-29€',
    hours: 'ti-pe 11:00-14:00',
    url: 'https://ravintolapaakari.fi/fi/lounas/',
    zone: 1,
    zoneLabel: 'Kangasalan lounaspaikat'
  }
];

// ── Tampere (paikkavaraus) ────────────────────────────────────────────────────

const tampereRestaurants = [
  // Tulossa pian
];

// ── Keskusta ──────────────────────────────────────────────────────────────────

const keskustaRestaurants = [
  // Vyöhyke 1: Aivan naapurissa (0–300 m)
  {
    id: 'jumbowl',
    name: 'Ravintola Jumbowl Noodle (4.6)',
    address: 'Arkadiankatu 19',
    distance: '~110m',
    price: '~13€',
    hours: 'ma-pe 11:00-15:00',
    url: 'https://jumbowl.fi',
    fixedMenu: true,
    fixedMenuNote: 'Käsintehtyjä nuudeleita — lista vaihtelee päivittäin',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'thirdplace',
    name: 'Third Place Pasta Bar (4.4)',
    address: 'Arkadiankatu 23',
    distance: '~160m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:30',
    url: 'https://www.thirdplace.fi',
    fixedMenu: true,
    fixedMenuNote: 'Tuorepasta-annoksia',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'wrapmaster',
    name: 'Wrap Master - Su’s kitchen (4.9)',
    address: 'Arkadiankatu 19c',
    distance: '~110m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.facebook.com/wrapmasterhelsinki',
    fixedMenu: true,
    fixedMenuNote: 'Wrappeja ja aasialaista',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'kantin',
    name: 'Kantin Lunch Club (4.7)',
    address: 'Arkadiankatu 23',
    distance: '~160m',
    price: '~13.50€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.kantin.fi',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'osteriadeigusti',
    name: 'Osteria dei Gusti (4.7)',
    address: 'Töölönkatu 1',
    distance: '~260m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://osteriadeigusti.fi',
    fixedMenu: true,
    fixedMenuNote: 'Aito italialainen lounas',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'shubhakamana',
    name: 'Shubha Kamana (4.5)',
    address: 'Dagmarinkatu 5',
    distance: '~190m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:30',
    url: 'https://shubhakamana.fi',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'dagmarbistro',
    name: 'Dagmar Bistro & Wine Bar (4.4)',
    address: 'Dagmarinkatu 4',
    distance: '~240m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.dagmarbistro.fi',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'manala',
    name: 'Manala (4.1)',
    address: 'Dagmarinkatu 2',
    distance: '~290m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.botta.fi/manala',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },

  // Vyöhyke 2: Lyhyen kävelymatkan päässä (alle 500 m)
  {
    id: 'pompier',
    name: 'Pompier Albertinkatu (4.5)',
    address: 'Albertinkatu 29',
    distance: '~450m',
    price: '14,50–19€',
    hours: 'ma-pe 10:45-14:00',
    url: 'https://pompier.fi/albertinkatu/',
    zone: 2,
    zoneLabel: 'Lyhyen kävelymatkan päässä (alle 500 m)'
  },
  {
    id: 'kuukuu',
    name: 'Ravintola KuuKuu (4.5)',
    address: 'Museokatu 17',
    distance: '~450m',
    price: '~14€',
    hours: 'ma-pe 12:00-15:00',
    url: 'https://www.kuukuu.fi',
    fixedMenu: true,
    fixedMenuNote: 'Klassinen skandinaavinen lounas',
    zone: 2,
    zoneLabel: 'Lyhyen kävelymatkan päässä (alle 500 m)'
  },
  {
    id: 'marocco',
    name: 'Kahvila Marocco (4.5)',
    address: 'Museokatu 7',
    distance: '~400m',
    price: '~12€',
    hours: 'ma-pe 10:30-14:00',
    url: 'https://www.lounaat.info/lounas/kahvila-marocco/helsinki',
    zone: 2,
    zoneLabel: 'Lyhyen kävelymatkan päässä (alle 500 m)'
  },
  {
    id: 'eka',
    name: 'Ravintola Eka (4.3)',
    address: 'Museokatu 29',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.ravintolaeka.fi',
    fixedMenu: true,
    fixedMenuNote: 'Kortteliravintolan makuja',
    zone: 2,
    zoneLabel: 'Lyhyen kävelymatkan päässä (alle 500 m)'
  },

  // Vyöhyke 3: Kampin yläkerta (Kortteli, 5. krs)
  {
    id: 'missyao',
    name: 'Miss Yao (4.6)',
    address: 'Kamppi Kortteli',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.facebook.com/missyaohelsinki',
    fixedMenu: true,
    fixedMenuNote: 'Aasialaista fuusiota',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  },
  {
    id: 'hoku',
    name: 'HOKU (4.5)',
    address: 'Kamppi Kortteli',
    distance: '~500m',
    price: '~15€',
    hours: 'ma-pe 11:00-15:00',
    url: 'https://www.hoku.fi',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  },
  {
    id: 'eatpoke',
    name: 'Eat Poke Kamppi (4.6)',
    address: 'Kamppi Kortteli',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://eatpoke.fi',
    fixedMenu: true,
    fixedMenuNote: 'Poke-kulhoja',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  },
  {
    id: 'pobre',
    name: 'Pobre (4.5)',
    address: 'Kamppi Kortteli',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://pobrecito.fi',
    fixedMenu: true,
    fixedMenuNote: 'Filippiiniläistä laatua',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  },
  {
    id: 'sandro',
    name: 'Sandro (4.1)',
    address: 'Kamppi Kortteli',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://sandro.fi',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  },
  {
    id: 'liemi',
    name: 'Lie Mi (4.2)',
    address: 'Kamppi Kortteli',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:30',
    url: 'https://liemi.fi',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  }
];

// ── Yhdistetty lista location-kentällä ───────────────────────────────────────

const restaurants = [
  ...ruoholahtiRestaurants.map(r => ({ ...r, location: 'ruoholahti' })),
  ...keskustaRestaurants.map(r => ({ ...r, location: 'keskusta' })),
  ...kangasalaRestaurants.map(r => ({ ...r, location: 'kangasala' })),
  ...tampereRestaurants.map(r => ({ ...r, location: 'tampere' }))
];

// Hae lounaslistat kaikista ravintoloista
async function fetchAllMenus() {
  console.log('Haetaan lounaslistoja...');
  const results = [];

  for (const restaurant of restaurants) {
    try {
      const scraper = scrapers[restaurant.id];
      if (scraper) {
        const menu = await scraper();
        results.push({
          ...restaurant,
          menu: menu,
          status: 'ok'
        });
        console.log(`✓ ${restaurant.name}: ${menu.items?.length || 0} annosta`);
      } else {
        results.push({
          ...restaurant,
          menu: { items: [], error: 'Scraperia ei ole vielä toteutettu' },
          status: 'not_implemented'
        });
        console.log(`⚠ ${restaurant.name}: scraperia ei ole vielä toteutettu`);
      }
    } catch (error) {
      results.push({
        ...restaurant,
        menu: { items: [], error: error.message },
        status: 'error'
      });
      console.log(`✗ ${restaurant.name}: ${error.message}`);
    }
  }

  menuCache = {
    lastUpdated: new Date().toISOString(),
    menus: results
  };

  console.log(`Lounaslistat päivitetty: ${new Date().toLocaleString('fi-FI')}`);
  return results;
}

// Staattisten tiedostojen tarjoilu
app.use(express.static(path.join(__dirname, '../public')));

// API-reitit
app.get('/api/menus', (req, res) => {
  res.json(menuCache);
});

app.get('/api/menus/:id', (req, res) => {
  const menu = menuCache.menus.find(m => m.id === req.params.id);
  if (menu) {
    res.json(menu);
  } else {
    res.status(404).json({ error: 'Ravintolaa ei löytynyt' });
  }
});

app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

app.get('/api/refresh', async (req, res) => {
  await fetchAllMenus();
  res.json({ message: 'Lounaslistat päivitetty', lastUpdated: menuCache.lastUpdated });
});

// Käynnistä palvelin
app.listen(PORT, async () => {
  console.log(`\n🍽️  Ruoholahden Lounassovellus`);
  console.log(`   Palvelin käynnissä: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/menus\n`);

  await fetchAllMenus();
});

// Ajastettu haku joka arkipäivä klo 06:00
cron.schedule('0 6 * * 1-5', () => {
  console.log('Ajastettu lounaslistojen päivitys...');
  fetchAllMenus();
});
