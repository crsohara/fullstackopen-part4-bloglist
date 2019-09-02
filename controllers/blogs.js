const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })

  response.json(blogs.map(blog => blog.toJSON()))

})

blogsRouter.post('/', async (request, response) => {

  const body = request.body

  if ( ! body.title || ! body.url) {
    return response.status(400).end()
  }

  const user = await User.findOne({})

  if ( ! body.likes ) {
    body.likes = 0
  }

  body.user = user._id

  const blog = new Blog(body)

  try {

    const result = await blog.save()

    user.blogs = user.blogs.concat(result._id)

    await user.save()

    return response.status(201).json(result)

  } catch (exception) {

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
