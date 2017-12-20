const axios = require('axios')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const uuidv4 = require('uuid/v4')
const path = require('path')
const mongoose = require('mongoose')

const Post = require('./models/Post')

const app = express()
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/guess-the-subreddit')

const port = 3000

app.use(session({
  secret: 'very-secure-random-secret-key-42',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use(express.static('static'))

app.get('/', (req, res) => {
  let sess = req.session
  sess.uid = uuidv4()
  // if below sess variables not set, set to init vals
  sess.lives = 10
  sess.score = 0
  sess.current = null
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/api', (req, res) => {
  let sess = req.session
  if (!sess.uid) return res.sendStatus(401)
  Post.findRandom().limit(1).exec((err, rand) => {
    if (err) return res.sendStatus(500)
    const post = rand[0]
    sess.current = post.id
    res.json({
      title: post.title,
      url: post.url
    })
  })
})

// Post.findRandom().limit(10).exec((err, p) => {
//   console.log(p[0])
// })

app.listen(port, () => console.log('Listening on port 3000.'))
