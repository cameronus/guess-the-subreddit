const axios = require('axios')
const express = require('express')
const crypto = require('crypto')
const app = express()

const port = 3000
const approved_domains = ['i.imgur.com', 'i.redd.it']

app.get('/', (req, res) => {
  // main page & get current content & hash sensitive data & send to client
  res.end('test')


})

app.get('/api', (req, res) => {
  let posts = []
  axios.get('https://www.reddit.com/.json')
  .then(response => {
    for (const post_object of response.data.data.children) {
      const post = post_object.data
      const domain = post.domain
      if (!post.over_18 && approved.indexOf(domain) > -1) {
        // const title = post.title
        const url = post.url
        const subreddit = post.subreddit
        // const time_posted = post.created_utc
        // const score = post.score
        // console.log(title, subreddit, url, (new Date(time_posted * 1000)).toLocaleString('en-US'), score)
        if (posts.length < 10) {
          posts.push({
            subreddit: crypto.createHash('sha256').update(subreddit).digest('hex'),
            url: url
          })
        }
      }
    }
  })
  .catch(error => {
    console.log(error)
    return res.json({
      error: true
    })
  })
  .then(() => {
    return res.json({
      error: false,
      data: posts
    })
  })
})

app.listen(port, () => console.log('Listening on port 3000.'))
