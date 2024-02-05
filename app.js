const express = require('express');
const app = express();
const apiRouter = require('./routes/api-router');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);
app.use('/api/articles', apiRouter);
app.use('/api/topics', apiRouter);
app.use('/api/users', apiRouter);

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
        res.status(400).send({ msg: 'invalid id' });
    }
});

//handles server error
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
  });
  

module.exports = app