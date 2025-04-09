const blogsRouter= require('express').Router()
const Blog= require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')




blogsRouter.get('/', async (request,response) => {
    const blogs= await Blog.find({}).populate('user', {username: 1, name: 1})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if(!decodedToken.id)
        response.status(401).json({error: 'token invalid'})

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id
    })

    if(!blog.likes)
        blog.likes=0   

    const savedBlog = await blog.save()
    console.log(savedBlog._id);
    
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    console.log(user.blogs);
    
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request,response) => {
    const blog = await Blog.findById(request.params.id)

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)

    if(blog.user._id.toString()===user._id.toString()){
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }
    else
    response.status(401).json({error: 'invalid token'})
})

blogsRouter.put('/:id', async (request,response) => {
    const {likes} = request.body
    const blog = await Blog.findById(request.params.id)

    blog.likes = likes

    await blog.save()
    response.json(blog)
})
module.exports = blogsRouter