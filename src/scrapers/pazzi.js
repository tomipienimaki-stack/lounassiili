// Trattoria Pazzi Kangasala — lounastaja.app JSON API

const fetchLounastaja = require('./lounastaja');

module.exports = async function() {
  return fetchLounastaja(
    'e08fc9fa-62d7-4309-b983-181feed999d6',
    '49gSiQAW6ZNmM8dpGOjg',
    'https://www.pazzi.fi'
  );
};
