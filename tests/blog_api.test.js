const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach( async () => {

  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map( blog => new Blog(blog) )

  const promiseArray = blogObjects.map( blog => blog.save() )

  await Promise.all(promiseArray)

})

test('blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.length).toBe(helper.initialBlogs.length)

})

test('blogs unique identifier is named id', async () => {

  const blogsInDb = await helper.blogsInDb()

  blogsInDb.map( blog => expect(blog.id).toBeDefined() )

})


afterAll( async () => {
  await Blog.deleteMany({})
  mongoose.connection.close()
  console.log('\n\n\n')
})
