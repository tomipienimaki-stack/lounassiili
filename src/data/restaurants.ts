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
    fixedMenu: true,
    fixedMenuNote: 'À la carte -nuudeliravintola (ei vaihtuvaa lounaslistaa)'
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
