const route = require('express').Router()
const user = require('../controllers/user')

route.post('/add', user.createRole)
route.get('/get', user.getRole)
route.get('/detail/:id', user.getRole)
route.patch('/update/:id', user.updateRole)

module.exports = route
