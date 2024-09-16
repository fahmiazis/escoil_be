const route = require('express').Router()
const auth = require('../controllers/auth')

route.post('/login', auth.login)

module.exports = route
