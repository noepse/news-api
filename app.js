const {getTopics, getEndpoints, getArticlesById, getArticles, getCommentsByArticleId, postCommentOnArticle, patchArticleVotes, deleteCommentById, getUsers} = require('./controllers/app.controllers')

const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticlesById)
app.patch('/api/articles/:article_id', patchArticleVotes)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)
app.post('/api/articles/:article_id/comments', postCommentOnArticle)

app.delete('/api/comments/:comment_id', deleteCommentById)

app.get('/api/users', getUsers)

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