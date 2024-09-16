const route = require('express').Router()
const classes = require('../controllers/classes')

route.post('/add', classes.addClass)
route.get('/get', classes.getClass)
route.patch('/detail', classes.getDetailClass)

module.exports = route
