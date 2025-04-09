const {test, beforeEach, after, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('../utils/test_helper')
const api = supertest(app)

describe('When there is initially one user in database', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('mycompanion', 10)
        const user = new User({username: 'Aas', passwordHash})

        await user.save()
    })

    test('Adding a new user is successful', async () => {
        const usersAtStart = await helper.usersInDB()

        const user = {
            username: 'Bakahead',
            name: 'Aashwin',
            password: '9827358067'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(201)
            .expect('Content-type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDB()

        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
        const usernames = usersAtEnd.map(u => u.username)

        assert(usernames.includes(user.username))
    })

    test('Users are successfully returned', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
    })

    test('Only unique usernames are created', async () => {
        const user = {
            username: 'Aas',
            name: 'Aashwin',
            password: 'Serj'
        }

        const response = await api
            .post('/api/users')
            .send(user)
            .expect(400)

        assert.deepStrictEqual(response.body.error, 'Username must be unique')
    })

    test('Creating new user with no password is unsuccessful', async () => {
        const user = {
            username: 'bak'
        }

        const response = await api
            .post('/api/users')
            .send(user)
            .expect(400)

        assert.deepStrictEqual(response.body.error, 'password is missing')        
    })

    test('Creating new user with password less than 3 characters is unsuccessful', async () => {
        const user = {
            username: 'bak',
            password: '22'
        }

        const response = await api
            .post('/api/users')
            .send(user)
            .expect(400)

        assert.deepStrictEqual(response.body.error, 'Password must atleast be three characters long')        
    })
})

after(async () => {
    await mongoose.connection.close()
})