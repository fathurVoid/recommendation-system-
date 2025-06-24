const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cosine = require('./cosine');

const app = express();
const port = 3000;

const gamesPath = path.join(__dirname, '..', 'data', 'games.json');
const games = JSON.parse(fs.readFileSync(gamesPath));


async function getPlayerVector(appid) {
  const url = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`;
  const res = await axios.get(url);
  const current = res.data.response.player_count;
  return [current, current * 1.1, current * 1.5];
}

app.use(express.static(path.join(__dirname, '..', 'front'))); // optional frontend

app.get('/recommend', async (req, res) => {
  const inputGame = req.query.game;
  const matchedKey = Object.keys(games).find(
  name => name.toLowerCase().includes(inputGame.toLowerCase().trim())
);

  const inputAppID = games[matchedKey];
  app.use(express.static(path.join(__dirname, '..', 'front')));


  if (!inputAppID) {
    return res.status(404).json({ error: 'Game not found in dataset.' });
  }

  const inputVector = await getPlayerVector(inputAppID);
  const results = [];

  for (const [name, appid] of Object.entries(games)) {
    if (name === inputGame) continue;

    try {
      const vec = await getPlayerVector(appid);
      const score = cosine(inputVector, vec);
      results.push({ name, similarity: score });
    } catch (err) {
      console.log(`❌ Failed to fetch ${name}: ${err.message}`);
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  res.json({ base: inputGame, recommended: results.slice(0, 5) });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
