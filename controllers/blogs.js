const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


const getTokenFrom = request => {

  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {

    return authorization.substring(7)

  }

  return null

}

blogsRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })

  response.json(blogs.map(blog => blog.toJSON()))

})

blogsRouter.post('/', async (request, response) => {

  const blog = request.body

  const token = getTokenFrom(request)

  try {

    const decodedToken = jwt.verify(token, process.env.SECRET)

    if ( ! token || ! decodedToken.id ) {
      return response.status(401).json({
        error: 'Missing or invalid token'
      })
    }

    if ( ! blog.title || ! blog.url) {
      return response.status(400).end()
    }

    if ( ! blog.likes ) {
      blog.likes = 0
    }

    const user = await User.findById(decodedToken.id)

    blog.user = user.id

    const newblog = new Blog(blog)

    const result = await newblog.save()

    user.blogs = user.blogs.concat(result._id)

    await user.save()

    return response.status(201).json(result)

  } catch (exception) {

    if (exception.name === 'JsonWebTokenError') {
      return response.status(400).json({ error: 'Invalid token' })
    }

    response.status(400).json({ error: exception })

  }

})

blogsRouter.delete('/:id', async (request, response) => {

  try {

    await Blog.findByIdAndRemove(request.params.id)

    return response.status(204).end()

  } catch (exception) {

    console.log(exception)

  }

})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body

  try {

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )

    return response.json(updatedBlog.toJSON())

  } catch(exception) {

    console.log(exception)

  }
})

module.exports = blogsRouter
