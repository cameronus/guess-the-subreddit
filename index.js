const axios = require('axios')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4')
const path = require('path')
const mongoose = require('mongoose')
const crypto = require('crypto')
const config = require('./config.json')

const app = express()

let Post
if (!config.dev) {
  Post = require('./models/Post')
  mongoose.Promise = global.Promise
  mongoose.connect('mongodb://localhost/guess-the-subreddit')
}

const port = 3000
const num_lives = 10

let options = {
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}

if (!config.dev) options.store = new MongoStore({ mongooseConnection: mongoose.connection })

app.use(session(options))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static('static'))

app.get('/', (req, res) => {
  let sess = req.session
  sess.uid = uuidv4()
  sess.lives = num_lives
  sess.score = 0
  sess.current = null
  sess.gamemode = null
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.post('/api/gamemode', (req, res) => {
  let sess = req.session
  if (!sess.current) return res.sendStatus(422)
  if (sess.lives != num_lives || sess.score != 0) return res.sendStatus(412)
  if (sess.gamemode != null) return res.sendStatus(412)
  const data = req.body
  if (data.gamemode !== 0 && data.gamemode !== 1) return res.sendStatus(400)
  sess.gamemode = data.gamemode
})

app.get('/api/question', (req, res) => {
  let sess = req.session
  if (sess.lives == 0) return res.sendStatus(412)
  if (config.dev) {
    sess.lives -= 1
    sess.score += 1
    return res.json({
      title: sess.gamemode == 0 ? config.post.title : null,
      url: config.post.url,
      score: sess.score,
      lives: sess.lives
    })
  }
  if (!sess.uid) return res.sendStatus(401)
  if (sess.current) {
    sess.lives -= 1
    if (sess.lives == 0) return res.json({
      score: sess.score,
      lives: sess.lives
    })
  }
  Post.findRandom().limit(1).exec((err, rand) => {
    if (err) return res.sendStatus(500)
    const post = rand[0]
    sess.current = post.id
    res.json({
      title: sess.gamemode == 0 ? post.title : null,
      url: post.url,
      score: sess.score,
      lives: sess.lives
    })
  })
})

app.post('/api/question', (req, res) => {
  let sess = req.session
  if (sess.lives == 0) return res.sendStatus(412)
  if (config.dev) {
    return res.json({
      correct: true,
      score: sess.score,
      lives: sess.lives
    })
  }
  if (!sess.uid) return res.sendStatus(401)
  if (!sess.current) return res.sendStatus(422)
  const data = req.body
  if (!data.subreddit) return res.sendStatus(422)
  Post.find({ id: sess.current }, (err, post) => {
    if (err || post.length == 0) return res.sendStatus(500)
    const correct = post[0].subreddit.toLowerCase() == data.subreddit.toLowerCase()
    correct ? sess.score += 1 : sess.lives -= 1
    if (correct) sess.current = null
    res.json({
      correct: correct,
      score: sess.score,
      lives: sess.lives
    })
  })
})

app.listen(port, () => console.log('Listening on port 3000.'))
