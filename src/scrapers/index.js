// Scrapers index — kaikki toteutetut lounashakijat

const antell       = require('./antell');
const pompier      = require('./pompier');
const foodco       = require('./foodco');
const halo         = require('./halo');
const pantry       = require('./pantry');
const sewa         = require('./sewa');
const roihu        = require('./roihu');
const chaophraya   = require('./chaophraya');
const houseofsalmon = require('./houseofsalmon');
const tokyostreet  = require('./tokyostreet');

module.exports = {
  antell,       // Antell Femma — WordPress REST API
  pompier,      // Pompier Albertinkatu — HTML scraper
  foodco,       // Food & Co Ruoholahti — Compass Group API
  halo,         // HALO Food & Events — WordPress REST API
  pantry,       // The Pantry Ruoholahti — lounaat.info
  sewa,         // Ravintola Sewa — staattinen Elementor HTML
  roihu,        // Ravintola Roihu — Compass Group API
  chaophraya,   // Chao Phraya — hietalahdenkauppahalli.fi
  houseofsalmon,// House of Salmon — hietalahdenkauppahalli.fi
  tokyostreet   // Tokyo Street — hietalahdenkauppahalli.fi
};
