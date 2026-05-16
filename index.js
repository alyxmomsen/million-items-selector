
const express = require('express');

const app = express();

const port = 3000;
const host = '0.0.0.0';

app.listen(3000, host, () => {
    console.log('hello there')
})