const crypto = require('crypto')
const mongoose = require('mongoose')

const Post = require('../models/Post')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/guess-the-subreddit')

prune()

function prune() {
  let total = 0
  Post.find({}, (err, posts) => {
    if (err) throw err
    for (const post of posts) {
      total += post.score
    }
    console.log('Average Score:', total/posts.length)
    console.log('Post Count:', posts.length)
  })
}
