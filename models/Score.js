const mongoose = require('mongoose')

const scoreSchema = mongoose.Schema({
  uid: String,
  username: String,
  score: Number
})

const Score = mongoose.model('Score', scoreSchema)

module.exports = Score
