const express = require('express');
const { readWordsFromFile } = require('./spider/util');

function createApp() {
  const app = express();

  app.use(express.static('public'));

  app.get('/', (_req, res) => {
    return res.send('index.html');
  });

  app.get('/data', (_req, res) => {
    const data = readWordsFromFile();
    return res.json(data);
  });

  return app;
}

module.exports = { createApp };
