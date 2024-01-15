const {getTopics, getEndpoints, getArticlesById} = require('./controllers/app.controllers')

const express = require('express');
const app = express();

app.get('/api/topics', getTopics);

app.get('/api', getEndpoints);

app.get('/api/articles/:article_id', getArticlesById)

// catches all errors that are not caught elsewhere
app.all('*', (req, res)=>{
    res.status(404).send({msg: 'endpoint not found'})
});

// catches specific errors
app.use((err, req, res, next)=>{
    if(err.status){
        res.status(err.status).send({ msg: err.msg });
  } else next(err);
});


//handles psql errors
app.use((err, req, res, next) => {
    if (err.code === "22P02"){
        res.status(400).send({ msg: 'invalid id entered' });
    }
});

//handles server error
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
  });
  

module.exports = app