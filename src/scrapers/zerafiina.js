// Lounaskahvila Zerafiina Kangasala — lounastaja.app JSON API

const fetchLounastaja = require('./lounastaja');

module.exports = async function() {
  return fetchLounastaja(
    '0cb91d2b-ad4f-4118-b1c6-2146912ca431',
    'dQYkRdvS2G7xd7DTWP1p',
    'https://zerafiina.fi'
  );
};
