const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
  candidates: {
    type: [String],
    required: true,
  },
  tieCandidates: {
    type: [String],
    required: true,
  },
  class: Number,
  nonce: {
    type: String,
    required: true,
    unique: true
  },
  hashedVote: {
    type: String,
    required: true
  }
})

const Posts = mongoose.model('Posts', postSchema)

module.exports = Posts
