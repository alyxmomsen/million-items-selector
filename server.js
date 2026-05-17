const express = require('express');
const path = require('path');
const itemsRouter = require('./routes/items');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/api', itemsRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});