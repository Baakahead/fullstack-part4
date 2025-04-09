const config = require('./utils/config')
const {info, error} = require('./utils/logger')
const express = require('express')
const app = express()
const blogsRouter = require('./controller/blogs')
const mongoose = require('mongoose')
const usersRouter = require('./controller/users')
const loginRouter = require('./controller/login')
const middleware = require('./utils/middleware')
mongoose.set('strictQuery', 'false')

info(`Connecting to MongoDB...`)

mongoose.connect(config.MONGODB_URI)
        .then(() => {
            info('Connected to MongoDB')
        })
        .catch(() => {
            error('Something went wrong(Connection unsuccessful)')
        })
        

app.use(express.json())
app.use(middleware.tokenExtractor)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.errorHandler)

module.exports = app