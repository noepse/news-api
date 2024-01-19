const {getTopics} = require('../controllers/app.controllers')

const topicRouter = require('express').Router();

topicRouter.get('/', getTopics)

module.exports = topicRouter;