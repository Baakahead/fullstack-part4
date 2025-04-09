const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

userRouter.post('/', async (request, response) => {
    const {username, name, password} = request.body
    const users = await User.find({})
    if(!password)
    {
        response.status(400).json({error: 'password is missing' })
    }
    else if(password.length<3)
    {
        response.status(400).json({error: 'Password must atleast be three characters long'})
    }
    else if(users.find(u => u.username===username))
    {
        response.status(400).json({error: 'Username must be unique'})
    }
    else{
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
}

})

userRouter.get('/', async (request, response) => {
    const user= await User.find({}).populate('blogs', {title: 1, url: 1, likes: 1})
    response.json(user) 
})

module.exports = userRouter