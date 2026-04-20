// Pepper Bar & Restaurant Kangasala — lounastaja.app JSON API

const fetchLounastaja = require('./lounastaja');

module.exports = async function() {
  return fetchLounastaja(
    'ccaf65e5-d3e7-4a53-926b-167e3f7f08f4',
    'NpLIFquYL9ZclOLX4Nzh',
    'https://pepper.fi'
  );
};
