const axios = require('axios')
const express = require('express')
const crypto = require('crypto')
const path = require('path')
const app = express()

const port = 3000
const posts_per_game = 10
const approved_domains = ['i.imgur.com'/*, 'i.redd.it'*/]
const approved_ext = ['jpg', 'png', 'gif']

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/api', (req, res) => {
  getPosts([], '', (err, posts) => {
    if (err) {
      return res.json({
        error: true
      })
    }
    return res.json({
      error: false,
      data: posts
    })
  })
})

async function getPosts(posts, after, cb) {
  axios.get('https://www.reddit.com/.json' + after)
  .then(response => {
    const page = response.data.data
    after = '?after=' + page.after
    for (const post_object of page.children) {
      const post = post_object.data
      const domain = post.domain
      let url = post.url
      if (!post.over_18 && approved_domains.indexOf(domain) > -1 && approved_ext.indexOf(url.substring(url.length - 3)) > -1) {
        const subreddit = post.subreddit.toLowerCase()
        if (domain == 'i.imgur.com') url = url.substring(0, url.length - 4) + 'h' + url.substring(url.length - 4)
        // if (domain == 'i.redd.it') url = url
        // const title = post.title
        // const time_posted = post.created_utc
        // const score = post.score
        // console.log(title, subreddit, url, (new Date(time_posted * 1000)).toLocaleString('en-US'), score)
        posts.push({
          subreddit: crypto.createHash('sha256').update(subreddit).digest('hex'),
          url: url
        })
        if (posts.length == posts_per_game) return posts
      }
    }
  })
  .catch(error => cb(true, null))
  .then(() => {
    if (posts.length == posts_per_game) cb(null, posts)
    return getPosts(posts, after, cb)
  })
}

app.listen(port, () => console.log('Listening on port 3000.'))
