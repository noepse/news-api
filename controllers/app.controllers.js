const { request } = require('http');
const {fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleId, submitCommentOnArticle, updateArticleVotes, removeCommentById, fetchUsers} = require('../models/app.models.js')
const fs = require('fs/promises')



exports.getTopics = 
(request, response, next)=>{
    fetchTopics().then((topics)=>{
        response.status(200).send({topics});
    })
}

exports.getEndpoints = (request, response, next) => {
    fs.readFile('./endpoints.json', 'utf-8')
    .then((result)=>{
        const endpoints = JSON.parse(result);
        response.status(200).send({endpoints});
    })
};

exports.getArticlesById = (request, response, next) => {
    const {article_id} = request.params
    fetchArticleById(article_id)
    .then((article)=>{
        response.status(200).send({article});
    }).catch(next)
}

exports.getArticles = ((request, response, next)=>{
    const {topic, sort_by, order_by} = request.query

    fetchArticles(topic, sort_by, order_by).then((articles)=>{
        response.status(200).send({articles});
    }).catch(next)
})

exports.getCommentsByArticleId = (request, response, next) =>{
    const {article_id} = request.params
    fetchCommentsByArticleId(article_id)
    .then((comments)=>{
        response.status(200).send({comments})
    }).catch(next);
}

exports.postCommentOnArticle = (request, response, next)=>{
    const {article_id} = request.params;
    const {username, body} = request.body
    
    submitCommentOnArticle(article_id, username, body)
    .then((comment)=>{
        response.status(201).send({comment})
    }).catch(next);
}

exports.patchArticleVotes = (request, response, next)=>{
    const {article_id} = request.params
    const {inc_votes} = request.body

    updateArticleVotes(article_id, inc_votes)
    .then((article)=>{
        response.status(200).send({article});
    }).catch(next)
}

exports.deleteCommentById = (request, response, next)=> {
    const {comment_id} = request.params;
    
    removeCommentById(comment_id)
    .then(()=>{
        response.status(204).send({})
    }).catch(next)
}

exports.getUsers = (request, response, next)=>{
    fetchUsers().then((users)=>{
        response.status(200).send({users});
    })
}