export interface Restaurant {
  id: string;
  name: string;
  address: string;
  distance: string;
  price: string;
  hours: string;
  url: string;
  location: 'ruoholahti' | 'keskusta' | 'kangasala' | 'tampere' | 'hameenlinna';
  zone?: number;
  zoneLabel?: string;
  fixedMenu?: boolean;
  fixedMenuNote?: string;
}

export const restaurants: Restaurant[] = [
  // Ruoholahti
  {
    id: 'halo',
    name: 'HALO Food & Events',
    address: 'Ruoholahdenkatu 21',
    distance: '0m',
    price: '~14€',
    hours: 'ma-pe 11:00-13:30',
    url: 'https://halorestaurant.fi',
    location: 'ruoholahti',
    zone: 1
  },
  {
    id: 'antell',
    name: 'Antell Femma',
    address: 'Itämerenkatu 5',
    distance: '~300m',
    price: '~13€',
    hours: 'ma-pe 11:00-13:30',
    url: 'https://www.antell.fi/ravintolat/antell-femma',
    location: 'ruoholahti',
    zone: 1
  },
  {
    id: 'pantry',
    name: 'The Pantry Ruoholahti',
    address: 'Ruoholahdenkatu',
    distance: '~200m',
    price: '~12€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://thepantry.fi/ruoholahti/',
    location: 'ruoholahti',
    zone: 1
  },
  // Kangasala
  {
    id: 'pazzi',
    name: 'Trattoria Pazzi',
    address: 'Kangasala',
    distance: '',
    price: '~13,50€',
    hours: 'ma-pe 10:30-15:00',
    url: 'https://www.pazzi.fi/lounas/',
    location: 'kangasala'
  },
  {
    id: 'zerafiina',
    name: 'Lounaskahvila Zerafiina',
    address: 'Kangasala',
    distance: '',
    price: '~13,30€',
    hours: 'ma-pe 10:30-14:00',
    url: 'https://zerafiina.fi/viikkolounas-kangasala/',
    location: 'kangasala'
  },
  {
    id: 'ninankeittio',
    name: 'Lounaskievari (Ninan Keittiö)',
    address: 'Alasenkuja 1, Kangasala',
    distance: '',
    price: '~13,20€',
    hours: 'ma-to 10:30-13:45, pe 10:30-13:30',
    url: 'https://www.ninankeittio.fi/kangasala-lounaskievari/',
    location: 'kangasala'
  },
  {
    id: 'makumaestro',
    name: 'Lounasravintola MakuMaestro',
    address: 'Hampuntie 1, Kangasala',
    distance: '',
    price: '~13,20€',
    hours: 'ma-pe 10:30-13:30',
    url: 'https://makumaestro.fi/#lounas',
    location: 'kangasala'
  },
  // Keskusta
  {
    id: 'jumbowl',
    name: 'Jumbowl Noodle',
    address: 'Arkadiankatu 19',
    distance: '~110m',
    price: '~15,50€',
    hours: 'ma-pe 11:00-21:00',
    url: 'https://jumbowl.fi/en/menu',
    location: 'keskusta',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)',
    fixedMenu: true,
    fixedMenuNote: 'À la carte -nuudeliravintola (ei vaihtuvaa lounaslistaa)'
  },
  {
    id: 'thirdplace',
    name: 'Third Place Pasta Bar',
    address: 'Arkadiankatu 23',
    distance: '~160m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:30',
    url: 'https://www.thirdplace.fi',
    location: 'keskusta',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)',
    fixedMenu: true,
    fixedMenuNote: 'Tuorepasta-annoksia (ei vaihtuvaa lounaslistaa)'
  },
  {
    id: 'wrapmaster',
    name: "Wrap Master – Su's Kitchen",
    address: 'Arkadiankatu 19c',
    distance: '~110m',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.facebook.com/wrapmasterhelsinki',
    location: 'keskusta',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)',
    fixedMenu: true,
    fixedMenuNote: 'Wrappeja ja aasialaista (ei vaihtuvaa lounaslistaa)'
  },
  {
    id: 'kantin',
    name: 'Kantin Lunch Club',
    address: 'Arkadiankatu 23',
    distance: '~160m',
    price: '~13,50€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.lounaat.info/lounas/kantin-lunch-club/helsinki',
    location: 'keskusta',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)'
  },
  {
    id: 'osteriadeigusti',
    name: 'Osteria dei Gusti',
    address: 'Töölönkatu 1',
    distance: '~260m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://osteriadeigusti.fi',
    location: 'keskusta',
    zone: 1,
    zoneLabel: 'Aivan naapurissa (0–300 m)',
    fixedMenu: true,
    fixedMenuNote: 'Aito italialainen lounas (ei vaihtuvaa lounaslistaa)'
  },
  {
    id: 'pompier',
    name: 'Pompier Albertinkatu',
    address: 'Albertinkatu 29',
    distance: '~450m',
    price: '14,50–19€',
    hours: 'ma-pe 10:45-14:00',
    url: 'https://www.lounaat.info/lounas/pompier/helsinki',
    location: 'keskusta',
    zone: 2,
    zoneLabel: 'Lyhyen kävelymatkan päässä (alle 500 m)'
  },
  {
    id: 'kuukuu',
    name: 'Ravintola KuuKuu',
    address: 'Museokatu 17',
    distance: '~450m',
    price: '~14€',
    hours: 'ma-pe 12:00-15:00',
    url: 'https://www.kuukuu.fi',
    location: 'keskusta',
    zone: 2,
    zoneLabel: 'Lyhyen kävelymatkan päässä (alle 500 m)',
    fixedMenu: true,
    fixedMenuNote: 'Klassinen skandinaavinen lounas (ei vaihtuvaa lounaslistaa)'
  },
  {
    id: 'marocco',
    name: 'Kahvila Marocco',
    address: 'Museokatu 7',
    distance: '~400m',
    price: '~12€',
    hours: 'ma-pe 10:30-14:00',
    url: 'https://www.lounaat.info/lounas/kahvila-marocco/helsinki',
    location: 'keskusta',
    zone: 2,
    zoneLabel: 'Lyhyen kävelymatkan päässä (alle 500 m)'
  },
  {
    id: 'sandro',
    name: 'Sandro Kortteli',
    address: 'Kamppi, Kortteli',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.lounaat.info/lounas/sandro-kortteli/helsinki',
    location: 'keskusta',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  },
  {
    id: 'liemi',
    name: 'Lie Mi Kortteli',
    address: 'Kamppi, Kortteli',
    distance: '~500m',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.lounaat.info/lounas/lie-mi/helsinki',
    location: 'keskusta',
    zone: 3,
    zoneLabel: 'Kampin yläkerta (Kortteli, 5. krs)'
  },
  // Hämeenlinna
  {
    id: 'uoma',
    name: 'Ravintola Uoma',
    address: 'Hämeenlinna',
    distance: '',
    price: '~14€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.ravintolauoma.fi/',
    location: 'hameenlinna'
  },
  {
    id: 'miller',
    name: "Miller's BBQ",
    address: 'Hämeenlinna',
    distance: '',
    price: '~15€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://millersbbq.fi/menu/',
    location: 'hameenlinna'
  },
  {
    id: 'himalaya',
    name: 'Ravintola Himalaya Kitchen',
    address: 'Hämeenlinna',
    distance: '',
    price: '~13€',
    hours: 'ma-pe 11:00-14:30',
    url: 'https://himalayakitchen.fi/',
    location: 'hameenlinna'
  },
  {
    id: 'lounasmesta',
    name: 'Ravintola Lounas-Mesta',
    address: 'Kapellimestarinkatu 2, Hämeenlinna',
    distance: '',
    price: '~12,70€',
    hours: 'ma-pe 10:30-14:00',
    url: 'https://lounasmesta.fi/lounaslista/',
    location: 'hameenlinna'
  },
  {
    id: 'lounaskulma',
    name: 'Maaritin Lounaskulma',
    address: 'Hämeenlinna',
    distance: '',
    price: '~12€',
    hours: 'ma-pe 10:30-14:00',
    url: 'https://www.maaritinlounaskulma.fi/',
    location: 'hameenlinna'
  },
  {
    id: 'popino',
    name: 'Ravintola Popino',
    address: 'Hämeenlinna',
    distance: '',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.popino.fi/lounas/',
    location: 'hameenlinna'
  },
  {
    id: 'brahe',
    name: 'Ravintola Brahe',
    address: 'Hämeenlinna',
    distance: '',
    price: '~13€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://braheravintolat.fi/',
    location: 'hameenlinna'
  },
  {
    id: 'seiska',
    name: 'Ravintola Seiska',
    address: 'Hämeenlinna',
    distance: '',
    price: '~13,20€',
    hours: 'ma-pe 11:00-14:00',
    url: 'https://www.ravintolaseiska.com/lounas',
    location: 'hameenlinna'
  },
  {
    id: 'myllytupa',
    name: 'Lounasravintola Myllytupa',
    address: 'Myllärinkatu 9, Hämeenlinna',
    distance: '',
    price: '~12€',
    hours: 'ma-pe 10:30-14:00',
    url: 'https://www.myllytupa.fi/lounasravintola',
    location: 'hameenlinna'
  },
  {
    id: 'bora',
    name: 'Ravintola Bora',
    address: 'Hätilänkatu 1, Hämeenlinna',
    distance: '',
    price: '~13,50€',
    hours: 'ti-pe 10:30-14:00',
    url: 'https://www.bora.fi/lounas',
    location: 'hameenlinna'
  }
];
