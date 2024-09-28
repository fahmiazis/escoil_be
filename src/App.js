const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const response = require('./helpers/response')
const morgan = require('morgan')
const authMiddleware = require('./middlewares/auth') // eslint-disable-line

const app = express()
const server = require('http').createServer(app)

const { APP_PORT, APP_URL } = process.env

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

const userRoute = require('./routes/user')
const roleRoute = require('./routes/role')
const classesRoute = require('./routes/classes')
const schoolRoute = require('./routes/school')
const authRoute = require('./routes/auth')

app.use('/user', authMiddleware, userRoute)
app.use('/role', authMiddleware, roleRoute)
app.use('/class', authMiddleware, classesRoute)
app.use('/school', authMiddleware, schoolRoute)
app.use('/auth', authRoute)

app.use('/uploads', express.static('assets/uploads'))
app.use('/masters', express.static('assets/masters'))
app.use('/documents', express.static('assets/documents'))

app.get('*', (req, res) => {
  response(res, 'Error route not found', {}, 404, false)
})

app.get('/', (req, res) => {
  response(res, 'Backend is Running')
})

server.listen(APP_PORT, () => {
  console.log(`App is running on port ${APP_URL}`)
})
