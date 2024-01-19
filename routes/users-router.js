const {getUsers} = require('../controllers/app.controllers')

const userRouter = require('express').Router();

userRouter.get('/', getUsers)

module.exports = userRouter;