const route = require('express').Router()
const school = require('../controllers/school')

route.post('/add', school.addSchool)
route.get('/get', school.getSchool)
route.patch('/detail', school.getDetailSchool)

module.exports = route
