const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({})

  response.json(blogs)

})

blogsRouter.post('/', async (request, response) => {

  const body = request.body

  if ( ! body.title || ! body.url) {
    return response.status(400).end()
  }

  if ( ! body.likes ) {
    body.likes = 0
  }

  const blog = new Blog(body)

  const result = await blog.save()

  return response.status(201).json(result)

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
