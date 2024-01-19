const { getEndpoints, getUsers, deleteCommentById} = require('../controllers/app.controllers')

const apiRouter = require('express').Router();
const articleRouter = require('./articles-router')
const topicRouter = require('./topics-router')
const userRouter = require('./users-router')
const commentRouter = require('./comments-router')

// apiRouter.get('/', (req, res) => {
//     res.status(200).send('All OK from API Router');
//   });

apiRouter.get('/', getEndpoints);

apiRouter.use('/topics', topicRouter);

apiRouter.use('/articles', articleRouter)

apiRouter.use('/users', userRouter)

apiRouter.use('/comments', commentRouter)
  
module.exports = apiRouter;