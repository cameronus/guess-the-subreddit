const crypto = require('crypto')
const request = require('request')
const mongoose = require('mongoose')

const Post = require('./models/Post')

const posts_per_game = 10
const approved_domains = ['i.imgur.com', 'i.redd.it']
const approved_ext = ['jpg', 'png', 'gif', 'jpeg', 'JPG', 'PNG']

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/guess-the-subreddit')

// getPosts([], '', (err, posts) => {
//   if (err) console.error(err)
//   console.log(posts.length)
// })
// function getPosts(posts, after, cb) {
//   axios.get('https://www.reddit.com/.json' + after)
//   .then(response => {
//     const page = response.data.data
//     after = '?after=' + page.after
//     for (const post_object of page.children) {
//       const post = post_object.data
//       const domain = post.domain
//       let url = post.url
//       if (!post.over_18 && approved_domains.indexOf(domain) > -1 && approved_ext.indexOf(url.substring(url.length - 3)) > -1) {
//         const subreddit = post.subreddit.toLowerCase()
//         if (domain == 'i.imgur.com') url = url.substring(0, url.length - 4) + 'h' + url.substring(url.length - 4)
//         // if (domain == 'i.redd.it') url = url
//         // const title = post.title
//         // const time_posted = post.created_utc
//         // const score = post.score
//         // console.log(title, subreddit, url, (new Date(time_posted * 1000)).toLocaleString('en-US'), score)
//         posts.push({
//           subreddit: crypto.createHash('sha256').update(subreddit).digest('hex'),
//           url: url
//         })
//         if (posts.length == posts_per_game) return posts
//       }
//     }
//   })
//   .catch(error => cb(true, null))
//   .then(() => {
//     if (posts.length == posts_per_game) cb(null, posts)
//     return getPosts(posts, after, cb)
//   })
// }









collect(2)
mongoose.disconnect()

function collect(pages) {
  collect_posts(pages, '')
}

function collect_posts(pages, after) {
  collect_from_page(after, a => {
    console.log(a)
    if (pages > 1) collect_posts(pages - 1, a)
  })
}

function collect_from_page(after, cb) {
  if (after != '') after = '?after=' + after
  request('https://www.reddit.com/.json' + after, (err, response, body) => {
    if (err) throw err
    const parsed = JSON.parse(body).data
    const posts = parsed.children
    cb(parsed.after)
    for (const raw_post of posts) {
      const post = raw_post.data
      if (check_post(post)) {
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
          if (err) return console.error(err)
        })
      }
    }
  })
}

function check_post(post) {
  return approved_domains.indexOf(post.domain) > -1
}
