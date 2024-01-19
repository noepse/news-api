const {getArticles, getArticlesById, getCommentsByArticleId, postCommentOnArticle, patchArticleVotes} = require('../controllers/app.controllers')

const articleRouter = require('express').Router();

articleRouter.get('/', getArticles)

articleRouter.get('/:article_id', getArticlesById)

articleRouter.patch('/:article_id', patchArticleVotes)

articleRouter.get('/:article_id/comments', getCommentsByArticleId)

articleRouter.post('/:article_id/comments', postCommentOnArticle)

module.exports = articleRouter;