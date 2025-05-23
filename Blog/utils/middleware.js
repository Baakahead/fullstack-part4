const logger = require('./logger')
const jwt = require('jsonwebtoken')

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if(error.name === 'ValidationError')
        return response.status(400).json({error:error.message})
    else if(error.name === 'JsonWebTokenError')
        return response.status(401).json({error:'invalid token'})

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if(authorization && authorization.startsWith('Bearer '))
        request["token"] = authorization.replace('Bearer ', '')

    next()
}

module.exports = {
    errorHandler,
    tokenExtractor
}