// Ruoholahden Lounas - Frontend

let menuData = null;
let activeFilter = 'all';

// Hae lounaslistat APIsta
async function fetchMenus() {
  try {
    const response = await fetch('/api/menus');
    menuData = await response.json();
    renderMenus();
    updateLastUpdated();
  } catch (error) {
    console.error('Virhe haettaessa lounaslistoja:', error);
    document.getElementById('restaurants').innerHTML =
      '<p class="error-message">Lounaslistojen lataus epäonnistui. Yritä päivittää sivu.</p>';
  }
}

// Päivitä "viimeksi päivitetty" -teksti
function updateLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (menuData?.lastUpdated) {
    const date = new Date(menuData.lastUpdated);
    el.textContent = `Päivitetty: ${date.toLocaleString('fi-FI')}`;
  }
}

// Renderöi ravintolakortit vyöhykkeittäin
function renderMenus() {
  const container = document.getElementById('restaurants');

  if (!menuData?.menus?.length) {
    container.innerHTML = '<p class="no-menu">Ei lounaslistoja saatavilla.</p>';
    return;
  }

  // Ryhmittele ravintolat vyöhykkeen mukaan
  const zones = {};
  menuData.menus.forEach(restaurant => {
    const zone = restaurant.zone || 0;
    if (!zones[zone]) {
      zones[zone] = { label: restaurant.zoneLabel || `Vyöhyke ${zone}`, restaurants: [] };
    }
    zones[zone].restaurants.push(restaurant);
  });

  // Renderöi vyöhyke kerrallaan järjestyksessä
  const html = Object.entries(zones)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, zone]) => {
      const cards = zone.restaurants.map(restaurant => {
        const filteredItems = filterItems(restaurant.menu?.items || []);
        return renderCard(restaurant, filteredItems);
      }).join('');

      return `
        <div class="zone-section">
          <div class="zone-header">
            <h2>${zone.label}</h2>
          </div>
          <div class="zone-grid">
            ${cards}
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = html;
}

// Renderöi yksittäinen ravintolakorttti
function renderCard(restaurant, filteredItems) {
  const isSameBuilding = restaurant.distance?.includes('0m');
  return `
    <div class="restaurant-card ${isSameBuilding ? 'highlight' : ''}">
      <div class="card-header ${isSameBuilding ? 'same-building' : ''}">
        <div class="restaurant-name">${restaurant.name}</div>
        <div class="restaurant-info">
          <span>${restaurant.distance}</span>
          <span>${restaurant.price}</span>
          <span>${restaurant.hours}</span>
        </div>
      </div>
      <div class="card-body">
        ${renderMenuItems(filteredItems, restaurant)}
      </div>
    </div>
  `;
}

// Suodata annokset ruokavalion mukaan
function filterItems(items) {
  if (activeFilter === 'all') return items;

  return items.filter(item => {
    if (!item.diets || item.diets.length === 0) return false;
    return item.diets.some(diet =>
      diet.toLowerCase().includes(activeFilter.toLowerCase())
    );
  });
}

// Renderöi yksittäisen ravintolan annokset
function renderMenuItems(items, restaurant) {
  if (restaurant.status === 'error') {
    return `<p class="error-message">Lounaslistaa ei voitu hakea: ${restaurant.menu?.error || 'Tuntematon virhe'}</p>`;
  }

  if (restaurant.status === 'not_implemented') {
    if (restaurant.fixedMenu) {
      return `<p class="fixed-menu-note">${restaurant.fixedMenuNote} <a href="${restaurant.url}" target="_blank" rel="noopener">Katso lista →</a></p>`;
    }
    return `<p class="no-menu">Lista vaihtelee — <a href="${restaurant.url}" target="_blank" rel="noopener">katso ravintolan sivulta →</a></p>`;
  }

  if (!items || items.length === 0) {
    if (activeFilter !== 'all') {
      return `<p class="no-menu">Ei ${activeFilter} annoksia tänään.</p>`;
    }
    return `<p class="no-menu">Ei lounaslistaa saatavilla. <a href="${restaurant.url}" target="_blank" rel="noopener">Katso ravintolan sivulta</a></p>`;
  }

  return `
    <ul class="menu-items">
      ${items.map(item => `
        <li class="menu-item">
          <div class="menu-item-name">${item.name}</div>
          ${item.diets?.length ? `
            <div class="menu-item-diets">
              ${item.diets.map(diet => `<span class="diet-tag ${diet}">${diet}</span>`).join('')}
            </div>
          ` : ''}
        </li>
      `).join('')}
    </ul>
  `;
}

// Suodatinnapit
function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderMenus();
    });
  });
}

// Päivitä-nappi
function setupRefresh() {
  const btn = document.getElementById('refreshBtn');

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Päivitetään...';

    try {
      await fetch('/api/refresh');
      await fetchMenus();
    } catch (error) {
      console.error('Päivitys epäonnistui:', error);
    }

    btn.disabled = false;
    btn.textContent = 'Päivitä nyt';
  });
}

// Alusta sovellus
document.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  setupRefresh();
  fetchMenus();
});
