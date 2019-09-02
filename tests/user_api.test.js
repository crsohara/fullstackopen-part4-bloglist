const mongoose = require('mongoose')
const User  = require('../models/user')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

describe('When there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('Creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'joakley',
      name: 'Jane Oakley',
      password: 'professoroak',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)

  })

  test('Creation fails with status 400 on duplicate username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Jane Oakley',
      password: 'professoroak',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)

  })

  test('Creation fails with status 400 when username too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'la',
      name: 'Larry Barry',
      password: 'jlimobthy',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('Creation fails with status 400 when password too short', async () => {

    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jimothy',
      name: 'Jim Oakley',
      password: 'ji',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password field too short')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)

  })

  test('Creation fails with status 400 when username is missing', async () => {

    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: '',
      name: 'Mark Hunt',
      password: 'market',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)

  })

  test('Creation fails with status 400 when password is missing', async () => {

    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'kimbak',
      name: 'Kim Bakey',
      password: '',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password is missing')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)

  })

})

afterAll( async () => {
  await User.deleteMany({})
  mongoose.connection.close()
  console.log('\n\n\n')
})
