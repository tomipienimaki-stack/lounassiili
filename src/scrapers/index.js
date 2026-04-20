// Scrapers index — kaikki toteutetut lounashakijat

// ── Ruoholahti ───────────────────────────────────────────────────────────────
const antell        = require('./antell');
const pompier       = require('./pompier');
const foodco        = require('./foodco');
const halo          = require('./halo');
const pantry        = require('./pantry');
const sewa          = require('./sewa');
const roihu         = require('./roihu');
const oasis         = require('./oasis');
const gresa         = require('./gresa');
const chaophraya    = require('./chaophraya');
const houseofsalmon = require('./houseofsalmon');
const tokyostreet   = require('./tokyostreet');

// ── Kangasala ─────────────────────────────────────────────────────────────────
const pazzi         = require('./pazzi');
const zerafiina     = require('./zerafiina');
const pepper        = require('./pepper');
const jalmari       = require('./jalmari');
const paakari       = require('./paakari');

module.exports = {
  // Ruoholahti
  antell,        // Antell Femma — WordPress REST API
  pompier,       // Pompier Albertinkatu — HTML scraper
  foodco,        // Food & Co Ruoholahti — Compass Group API
  halo,          // HALO Food & Events — WordPress REST API
  pantry,        // The Pantry Ruoholahti — lounaat.info
  sewa,          // Ravintola Sewa — staattinen HTML
  roihu,         // Ravintola Roihu — Compass Group API
  oasis,         // Oasis Ruoholahti — Nordrest HTML
  gresa,         // Ravintola Gresa — Nordrest HTML
  chaophraya,    // Chao Phraya — hietalahdenkauppahalli.fi
  houseofsalmon, // House of Salmon — hietalahdenkauppahalli.fi
  tokyostreet,   // Tokyo Street — hietalahdenkauppahalli.fi

  // Kangasala
  pazzi,         // Trattoria Pazzi — lounastaja.app JSON API
  zerafiina,     // Lounaskahvila Zerafiina — lounastaja.app JSON API
  pepper,        // Pepper Bar & Restaurant — lounastaja.app JSON API
  jalmari,       // Kulttuuriravintola Jalmari — kangasala-talo.fi HTML
  paakari        // Ravintola Paakari — ravintolapaakari.fi HTML
};
