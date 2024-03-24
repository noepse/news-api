const {getArticles, getArticleById, deleteArticleById, getCommentsByArticleId, postCommentOnArticle, patchArticleVotes, postArticle} = require('../controllers/app.controllers')

const articleRouter = require('express').Router();

articleRouter.get('/', getArticles)
articleRouter.post('/', postArticle)

articleRouter.get('/:article_id', getArticleById)
articleRouter.delete('/:article_id', deleteArticleById)

articleRouter.patch('/:article_id', patchArticleVotes)

articleRouter.get('/:article_id/comments', getCommentsByArticleId)

articleRouter.post('/:article_id/comments', postCommentOnArticle)

module.exports = articleRouter;