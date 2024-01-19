const {deleteCommentById} = require('../controllers/app.controllers')

const commentRouter = require('express').Router();

commentRouter.delete('/:comment_id', deleteCommentById)

module.exports = commentRouter;