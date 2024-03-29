const config = require('./utils/config')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const blogsRouter = require('./controllers/blogs')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')

console.log('connecting to MongoDB...')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB!')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

app.use(cors())

app.use(express.static('build'))

app.use(bodyParser.json())

app.use(middleware.tokenExtractor)

app.use('/api/login', loginRouter)

app.use('/api/users', usersRouter)

app.use('/api/blogs', blogsRouter)

module.exports = app
