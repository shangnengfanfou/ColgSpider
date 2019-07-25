const { readWordsFromFile } = require('./spider/util');
const express = require('express');
const app = express();
const { PORT } = require('./const/_variables');
require('./spider/spider')

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`app start at http://localhost:${PORT}`);
})

app.get('/', (req, res) => {
    return res.send('index.html');
})

app.get('/data', (req, res) => {
    const data = readWordsFromFile();
    return res.json(data);
})