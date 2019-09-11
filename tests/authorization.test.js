const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach( async () => {

  await Blog.deleteMany({})

})

describe('Authorization', () => {

  test('Blog creation succeeds with valid token', async () => {

    const blogsAtStart = await helper.blogsInDb()

    await User.deleteMany({})

    const username = 'johnsmith'

    const newBlog =  {
      title: 'hello woorld',
      author: 'James Change hello world',
      url: 'https://reactpatterns.com/',
      likes: 1
    }

    const userResponse = await api
      .post('/api/users')
      .send({
        username,
        name: 'john',
        password: 'helloworld'
      })
      .expect(201)

    const userId = userResponse.body.id

    const loginResponse = await api
      .post('/api/login')
      .send({
        username,
        password: 'helloworld'
      })
      .expect(200)

    const authToken = `bearer ${loginResponse.body.token}`

    const blogResponse = await api
      .post('/api/blogs')
      .set({Authorization: authToken})
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    const newBlogsUserId = blogResponse.body.user

    expect(blogsAtEnd.length).toBe(blogsAtStart.length + 1)

    expect(newBlogsUserId).toBe(userId)

  })

  test('Blog creation fails with invalid token', async () => {

    const blogsAtStart = await helper.blogsInDb()

    const newBlog =  {
      title: 'hello woorld',
      author: 'James Chan',
      url: 'https://reactpatterns.com/',
      likes: 1
    }

    const response = await api
      .post('/api/blogs')
      .set({Authorization: 'invalidAuthToken'})
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('Invalid token')

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length)

  })
})



afterAll( async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  mongoose.connection.close()
  console.log('\n\n\n')
})
