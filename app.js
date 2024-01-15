const {getTopics, getEndpoints} = require('./controllers/app.controllers')

const express = require('express');
const app = express();

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

// catches all errors that are not caught elsewhere
app.all('*', (req, res)=>{
    res.status(404).send({msg: 'endpoint not found'})
});

//handles server error
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
  });
  

module.exports = app