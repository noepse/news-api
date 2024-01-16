const {fetchTopics, fetchArticleById} = require('../models/app.models.js')
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
        response.status(200).status(200).send({article});
    }).catch(next)
}