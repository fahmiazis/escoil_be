const route = require('express').Router()
const user = require('../controllers/user')

route.post('/add', user.addUser)
route.get('/get', user.getUser)
route.patch('/update/:id', user.updateUser)
route.delete('/delete/:id', user.deleteUser)
route.get('/detail/:id', user.getDetailUser)
route.post('/master', user.uploadMasterUser)
route.post('/upimage/:id', user.uploadImage)
route.get('/export', user.exportSqlUser)
route.patch('/password', user.changePassword)
route.patch('/reset/:id', user.resetPassword)
route.post('/role/add', user.createRole)
route.get('/role/get', user.getRole)
route.get('/role/detail/:id', user.getRole)
route.patch('/role/update/:id', user.updateRole)

module.exports = route
