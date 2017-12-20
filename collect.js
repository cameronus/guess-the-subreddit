const crypto = require('crypto')
const request = require('request')
const mongoose = require('mongoose')

const Post = require('./models/Post')

const posts_per_game = 10
const approved_domains = ['i.imgur.com', 'i.redd.it']
const approved_ext = ['jpg', 'png', 'gif', 'jpeg', 'JPG', 'PNG']

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/guess-the-subreddit')

collect(30)

function collect(pages) {
  collect_posts(pages, '', 0, count => {
    console.log(count + ' posts added to the database.')
    // Post.findRandom().limit(10).exec((err, p) => {
    //   console.log(p[0])
    // })
  })
}

function collect_posts(pages, after, count, cb) {
  collect_from_page(after, (a, c) => {
    if (pages == 1) return cb(count + c)
    collect_posts(pages - 1, a, count + c, cb)
  })
}

function collect_from_page(after, cb) {
  if (after != '') after = '?after=' + after
  request('https://www.reddit.com/.json' + after, (err, response, body) => {
    if (err) throw err
    const parsed = JSON.parse(body).data
    const posts = parsed.children
    let count = 0
    for (const raw_post of posts) {
      const post = raw_post.data
      if (check_post(post)) {
        count++
        const entry = new Post({
          id: post.id,
          title: post.title,
          author: post.author,
          score: post.score,
          url: post.url,
          subreddit: post.subreddit,
          domain: post.domain,
          created_utc: post.created_utc
        })
        entry.save((err, response) => {
          if (err) throw err
        })
      }
    }
    cb(parsed.after, count)
  })
}

function check_post(post) {
  return approved_domains.indexOf(post.domain) > -1 && approved_ext.indexOf(post.url.substring(post.url.length - 3)) > -1
}
