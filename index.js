const axios = require('axios')
const express = require('express')
const crypto = require('crypto')
const path = require('path')
const app = express()

const port = 3000
const posts_per_game = 10

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/api', (req, res) => {

})

// Post.findRandom().limit(10).exec((err, p) => {
//   console.log(p[0])
// })

app.listen(port, () => console.log('Listening on port 3000.'))
