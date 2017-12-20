const mongoose = require('mongoose')

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

const Post = mongoose.model('Post', postSchema)

module.exports = Post
