const _ = require('lodash')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer)
}

const mostBlogs = (blogs) => {
  return blogs.length === 0
    ? 0
    : _(blogs).countBy('author').invert()
      .map(function(author, blogs) { return { author: author, blogs: parseInt(blogs) }})
      .reduce(function(prev, current) {return prev.blogs < current.blogs ? current : prev})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
}
