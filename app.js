const {getTopics} = require('./controllers/app.controllers')

const express = require('express');
const app = express();

app.get('/api/topics', getTopics)

// catches all errors that are not caught elsewhere
app.all('*', (req, res)=>{
    res.status(404).send({msg: 'endpoint not found'})
});

module.exports = app