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


test('blog is created successfully', async() => {

  const newBlog = {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const blogsInDb = await helper.blogsInDb()

  expect(blogsInDb.length === helper.initialBlogs.length + 1)

  const contents = blogsInDb.map(blog => blog.title)

  expect(contents).toContain('Canonical string reduction')

})

test('blog without likes property sets likes to 0', async () => {

  const newBlog =  {
    title: 'React patterns',
    author: 'James Chan',
    url: 'https://reactpatterns.com/',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const blogsInDb = await helper.blogsInDb()

  expect(blogsInDb.length === helper.initialBlogs.length + 1)

  blogsInDb.map( blog => expect(blog.likes).toBeGreaterThanOrEqual(0) )

})

test('blog POSTed without title or url returns status 400', async () => {

  const newBlog =  {
    author: 'James Chan',
    url: 'https://reactpatterns.com/',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

})

test('delete a blog', async () => {

  const blogsInDb = await helper.blogsInDb()

  const blogToDelete = blogsInDb[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsInDbAfterDeletion = await helper.blogsInDb()

  expect(blogsInDbAfterDeletion.length).toBe(helper.initialBlogs.length - 1)

  const contents = blogsInDbAfterDeletion.map(blog => blog.id)

  expect(contents).not.toContain(blogToDelete.id)

})


afterAll( async () => {
  await Blog.deleteMany({})
  mongoose.connection.close()
  console.log('\n\n\n')
})
