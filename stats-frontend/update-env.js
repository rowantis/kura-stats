const name = `public-env.${process.env.NETWORK}.json`

const publicEnv = require(`./${name}`);

const TOKENLIST_URL = publicEnv.TOKENLIST_URL;

console.log(TOKENLIST_URL, 'TOKENLIST_URL')

// scripts/update-env.js
const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.resolve(__dirname, `./${name}`);

https.get(TOKENLIST_URL, (res) => {
  let data = '';
  res.on('data', chunk => (data += chunk));
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const addresses = parsed.tokens.map(token => token.address);

      const publicEnv = fs.existsSync(envPath) ? JSON.parse(fs.readFileSync(envPath, 'utf-8')) : {};
      publicEnv.WHITELIST_TOKENS = addresses;

      fs.writeFileSync(envPath, JSON.stringify(publicEnv, null, 2));
      console.log(`✅ WHITELIST_TOKENS updated in public-env.json (${addresses.length} tokens)`);
    } catch (e) {
      console.error('❌ Failed to update public-env.json:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('❌ Error downloading token list:', err.message);
});