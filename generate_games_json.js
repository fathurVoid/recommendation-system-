const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchPopularGames(limit = 50) {
  const url = 'https://steamspy.com/api.php?request=top100in2weeks';
  try {
    const res = await axios.get(url);
    const games = res.data;

    const result = {};
    let count = 0;
    for (const key in games) {
      if (count >= limit) break;
      const game = games[key];
      result[game.name] = game.appid;
      count++;
    }

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    fs.writeFileSync(path.join(dataDir, 'games.json'), JSON.stringify(result, null, 2));
    console.log(`✅ Generated games.json with ${count} entries`);
  } catch (err) {
    console.error("❌ Failed to fetch games:", err.message);
  }
}

fetchPopularGames(1000);
