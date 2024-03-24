const { request } = require('http');
const {fetchTopics, fetchArticleById, removeArticleById, fetchArticles, fetchCommentsByArticleId, submitCommentOnArticle, updateArticleVotes, removeCommentById, fetchUsers, fetchUserByUsername, updateCommentVotes, submitArticle} = require('../models/app.models.js')
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

exports.getArticleById = (request, response, next) => {
    const {article_id} = request.params
    fetchArticleById(article_id)
    .then((article)=>{
        response.status(200).send({article});
    }).catch(next)
}

exports.deleteArticleById = (request, response, next) => {
    const {article_id} = request.params
    removeArticleById(article_id)
    .then(()=>{
        response.status(204).send({})
    }).catch(next)
}

exports.getArticles = ((request, response, next)=>{
    const {topic, sort_by, order_by, limit, p} = request.query

    fetchArticles(topic, sort_by, order_by, limit, p).then((articles)=>{
        response.status(200).send({total_count: articles.length, articles});
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

exports.getUserByUsername = (request, response, next) =>{
    const {username} = request.params
    fetchUserByUsername(username).then((user)=>{
        response.status(200).send({user})
    }).catch(next)
}

exports.patchCommentVotes = (request, response, next)=>{
    const {comment_id} = request.params
    const {inc_votes} = request.body

    updateCommentVotes(comment_id, inc_votes)
    .then((comment)=>{
        response.status(200).send({comment});
    }).catch(next)
}

exports.postArticle = (request, response, next)=>{
    const {author, title, body, topic, article_img_url} = request.body

    submitArticle(author, title, body, topic, article_img_url).then((article)=>{
        response.status(201).send({article});
    }).catch(next);
}