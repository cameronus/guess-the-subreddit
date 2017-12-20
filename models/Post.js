const mongoose = require('mongoose')
const random = require('mongoose-random')

const postSchema = mongoose.Schema({
  id: String,
  title: String,
  author: String,
  score: Number,
  url: String,
  subreddit: String,
  domain: String,
  created_utc: Number
})

postSchema.plugin(random, { path: 'r' })

const Post = mongoose.model('Post', postSchema)

module.exports = Post
