const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4')
const path = require('path')
const mongoose = require('mongoose')
const crypto = require('crypto')
const config = require('./config.json')
const xss = require('xss')

const app = express()

let Post, Score
if (!config.dev) {
  Post = require('./models/Post')
  Score = require('./models/Score')
  mongoose.Promise = global.Promise
  mongoose.connect('mongodb://localhost/guess-the-subreddit')
}

let lex
if (config.ssl) {
  lex = require('greenlock-express').create({
    server: config.ssl_staging ? 'staging' : 'https://acme-v01.api.letsencrypt.org/directory',
    challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '/tmp/acme-challenges' }) },
    store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' }),
    approveDomains: approveDomains
  })
}

function approveDomains(opts, certs, cb) {
  if (certs) {
    opts.domains = certs.altnames
  } else {
    opts.email = config.ssl_email
    opts.agreeTos = true
  }
  cb(null, { options: opts, certs: certs })
}

const port = config.port
const num_lives = 10

let options = {
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}

if (!config.dev) options.store = new MongoStore({ mongooseConnection: mongoose.connection })

app.disable('x-powered-by')
app.use(session(options))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static('static'))
if (config.external_storage) app.use('/posts', express.static(path.resolve(config.external_storage_path)))

app.get('/', (req, res) => {
  let sess = req.session
  sess.uid = uuidv4()
  sess.lives = num_lives
  sess.score = 0
  sess.current = null
  sess.gamemode = null
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/api/leaderboard', (req, res) => {
  if (config.dev) return res.json([{ username: 'username', score: 24 }])
  let sess = req.session
  if (!sess.uid) return res.sendStatus(401)
  Score.find({}, 'username score').limit(15).sort({ score: -1 }).exec((err, scores) => {
    if (err) res.sendStatus(500)
    res.json(scores)
  })
})

app.post('/api/gamemode', (req, res) => {
  let sess = req.session
  if (!sess.uid) return res.sendStatus(401)
  if (sess.lives != num_lives || sess.score != 0) return res.sendStatus(412)
  if (sess.gamemode != null) return res.sendStatus(412)
  const data = req.body
  const gamemode = parseInt(data.gamemode)
  if (gamemode !== 0 && gamemode !== 1) return res.sendStatus(400)
  sess.gamemode = gamemode
  res.sendStatus(200)
})

app.get('/api/question', (req, res) => {
  let sess = req.session
  if (!sess.uid) return res.sendStatus(401)
  if (sess.lives == 0) return res.sendStatus(412)
  if (sess.gamemode == null) return res.sendStatus(412)
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
  let last = null
  if (sess.current) {
    sess.lives -= 1
    last = sess.current
    if (sess.lives == 0) return res.json({
      score: sess.score,
      lives: sess.lives
    })
  }
  Post.findRandom().limit(1).exec((err, rand) => {
    if (err || rand.length == 0) return res.sendStatus(500)
    const post = rand[0]
    sess.current = post.id
    const id_hash = crypto.createHash('sha256').update(post.id).digest('hex')
    const file_ext = path.extname(post.url)
    const url = req.protocol + '://' + req.headers.host + '/posts/' + id_hash + file_ext
    let response = {
      title: sess.gamemode == 0 ? post.title : null,
      url: url,
      score: sess.score,
      lives: sess.lives,
      last: null
    }
    if (last) {
      Post.find({ id: last }, (error, posts) => {
        if (error || posts.length == 0) return res.sendStatus(500)
        response.last = posts[0].subreddit
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })
})

app.post('/api/question', (req, res) => {
  let sess = req.session
  if (!sess.uid) return res.sendStatus(401)
  if (sess.lives == 0) return res.sendStatus(412)
  if (sess.gamemode == null) return res.sendStatus(412)
  if (config.dev) {
    return res.json({
      correct: true,
      score: sess.score,
      lives: sess.lives
    })
  }
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

app.post('/api/leaderboard', (req, res) => {
  let sess = req.session
  if (!sess.uid) return res.sendStatus(401)
  if (!sess.lives == 0) return res.sendStatus(412)
  if (sess.gamemode != 1) return res.sendStatus(401)
  if (config.dev) return res.sendStatus(412)
  const data = req.body
  if (!data.username) return res.sendStatus(422)
  const entry = new Score({
    uid: sess.uid,
    username: xss(data.username),
    score: sess.score
  })
  entry.save((err, response) => {
    if (err) return res.sendStatus(500)
    req.session.destroy((err) => {
      if (err) return res.sendStatus(500)
      res.sendStatus(200)
    })
  })
})

app.use((req, res) => {
  res.end('404 Page Not Found')
})

if (config.ssl) {
  require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, () => {
    console.log(`Listening (http) on port 80.`)
  })
  require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
    console.log(`Listening (https) on port 443.`)
  })
} else {
  app.listen(port, () => console.log(`Listening on port ${port}.`))
}
