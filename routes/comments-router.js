const {deleteCommentById, patchCommentVotes} = require('../controllers/app.controllers')

const commentRouter = require('express').Router();

commentRouter.patch('/:comment_id', patchCommentVotes)
commentRouter.delete('/:comment_id', deleteCommentById)

module.exports = commentRouter;