const route = require('express').Router()
const classes = require('../controllers/classes')

route.post('/login', classes.login)

module.exports = route
