const {test, beforeEach, after, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('../utils/test_helper')
const api = supertest(app)

const initialBlogs = [
    {
        title: "Eating healthy is overrated",
        author: "Aashwin",
        url: "nourl.com",
        likes: 34
    },
    {
        title: "Walking is overrated(lay on a couch instead)",
        author: "Aashwin",
        url: "doesntexist.org",
        likes: 12
    }
]

beforeEach( async () =>{
    await Blog.deleteMany({})

    for(let blog of initialBlogs){
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})
describe('When viewing the blogs', () => {

    test('blogs are returned in json format', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
    })
    
    test('two blogs are returned', async () => {
        const response= await api.get('/api/blogs')
    
        assert.strictEqual(response.body.length, initialBlogs.length)
    })
    
    test('unique identifier of the returned blog is named id', async () => {
        const blog = await Blog.find({})
        expect(blog[0]._id).toBeDefined()
    }) 
})

describe('Addition of new blog', () => {
    test('new blog is added successfully', async () =>{
        const blog = {
            title: "Japanese girls have the cutest voice",
            author: "Aashwin",
            url: "womp.com",
            likes: 12
        }
    
        await api
            .post('/api/blogs')
            .send(blog)
            .expect(201)
            .expect('Content-Type',/application\/json/)
        
        const response = await api.get('/api/blogs')
    
        assert.strictEqual(response.body.length,initialBlogs.length + 1)
    })
    
    test('if likes is not specified then likes is defaulted to 0', async () =>{
        const blogWithNoLikes = {
            title: "Liking a blog makes no sense",
            author: "Aashwin",
            url: "nourl.com"
        }
    
        await api
            .post('/api/blogs')
            .send(blogWithNoLikes)
    
        const response = await api.get('/api/blogs')
        
        const blog = response.body.find(b => b.title==="Liking a blog makes no sense")
        
        assert.strictEqual(blog.likes,0)
    })
    test('If url or title is missing, return 400 bad request'), async () =>{
        const blogWithoutTitle = {
            author:"Aashwin",
            url:"noTitleBlogs.com",
            likes: 22
        }
    
        await api
            .post('/api/blogs')
            .send(blogWithoutTitle)
            .expect(400)
        
        const blogWithoutURL = {
            title:"You will never know why my blog has so many likes",
            author:"Aashwin",
            likes: 2312
        }
    
        await api
            .post('/api/blogs')
            .send(blogWithoutURL)
            .expect(400)
    }
    test('Updating the number of likes is successful', async () => {
        const initialBlogs = await Blog.find({})
        const blogToUpdate = initialBlogs[0]

        const newBlog = {
            ...blogToUpdate,
            likes:blogToUpdate.likes + 1
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(newBlog)
            .expect(200)

        const finalBlogs = await Blog.find({})
        const updatedBlog = finalBlogs.find(b => b.likes===35)

        assert.strictEqual(updatedBlog.likes, 35)
    })
})
describe('Deleting a blog', () => {
    test('Blog is successfully deleted', async () => {
        const blogsAtStart = await Blog.find({})
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete._id}`)
            .expect(204)
        const blogsAtEnd = await Blog.find({})
        console.log(blogsAtEnd);
        
        assert.strictEqual(blogsAtEnd.length, initialBlogs.length-1)
    })
})  

after(async () => {
    await mongoose.connection.close()
})