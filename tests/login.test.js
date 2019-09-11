const mongoose = require('mongoose')
const User  = require('../models/user')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('Log in', () => {

  test('Successful with a valid username and password', async () => {
    await User.deleteMany({})
    const testUser = { username: 'root', password: 'sekret' }

    await api
      .post('/api/users')
      .send(testUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const result = await api
      .post('/api/login')
      .send(testUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body.username).toBe(testUser.username)

  })

  test('Unsuccessful with an invalid password', async () => {
    await User.deleteMany({})
    const testUser = { username: 'root', password: 'sekret' }
    const incorrectUser = { username: 'root', password: 'imnotright' }

    await api
      .post('/api/users')
      .send(testUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const result = await api
      .post('/api/login')
      .send(incorrectUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('invalid username or password')

  })
})

afterAll( async () => {
  await User.deleteMany({})
  mongoose.connection.close()
  console.log('\n\n\n')
})
