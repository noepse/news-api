const { request } = require('../app.js');
const {fetchTopics, fetchEndpoints, fetchArticleById} = require('../models/app.models.js')

exports.getTopics = 
(request, response, next)=>{
    fetchTopics().then((topics)=>{
        response.status(200).send({topics});
    })
}

exports.getEndpoints = (request, response, next) => {
    fetchEndpoints().then((endpoints)=>{
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