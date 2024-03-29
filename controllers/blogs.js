const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })

  response.json(blogs.map(blog => blog.toJSON()))

})

blogsRouter.post('/', async (request, response) => {

  const blog = request.body

  try {
    
    if ( ! request.token ) {
      return response.status(401).json({
        error: 'Missing or invalid token'
      })
    }

    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if ( ! decodedToken.id ) {
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

    // too hacky
    // result.populate('user', {
    //     username: 1,
    //     name: 1
    //   }, () => {})
    const populatedBlog = await Blog.findById(result._id).populate('user', {
      username: 1,
      name: 1
    })

    return response.status(201).json(populatedBlog)

  } catch (exception) {

    if (exception.name === 'JsonWebTokenError') {
      return response.status(400).json({ error: 'Invalid token' })
    }

    response.status(400).json({ error: exception })

  }

})

blogsRouter.delete('/:id', async (request, response) => {

  if ( ! request.token ) {
    return response.status(401).json({
      error: 'Missing or invalid token'
    })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if ( ! decodedToken.id ) {
    return response.status(401).json({
      error: 'Missing or invalid token'
    })
  }

  try {

    await Blog.findByIdAndRemove(request.params.id)

    return response.status(204).end()

  } catch (exception) {

    if (exception.name === 'JsonWebTokenError') {
      return response.status(400).json({ error: 'Invalid token' })
    }

    response.status(400).json({ error: exception })

  }

})

blogsRouter.put('/:id', async (request, response) => {

  if ( ! request.token ) {
    return response.status(401).json({
      error: 'Missing or invalid token'
    })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if ( ! decodedToken.id ) {
    return response.status(401).json({
      error: 'Missing or invalid token'
    })
  }

  const blog = request.body

  try {

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } ).populate('user', {
      username: 1,
      name: 1
    })

    return response.json(updatedBlog.toJSON())

  } catch(exception) {
    if (exception.name === 'JsonWebTokenError') {
      return response.status(400).json({ error: 'Invalid token' })
    }

    response.status(400).json({ error: exception })

  }
})

module.exports = blogsRouter
