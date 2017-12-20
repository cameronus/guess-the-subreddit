const crypto = require('crypto')
const request = require('request')
const mongoose = require('mongoose')

const posts_per_game = 10
const approved_domains = ['i.imgur.com', 'i.redd.it']
const approved_ext = ['jpg', 'png', 'gif', 'jpeg', 'JPG', 'PNG']

mongoose.connect('mongodb://localhost/guess-the-subreddit')

collect_from_page()

// getPosts([], '', (err, posts) => {
//   if (err) console.error(err)
//   console.log(posts.length)
// })
function getPosts(posts, after, cb) {
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







function collect_posts() {

}

function collect_from_page() {
  request('https://www.reddit.com/.json', (err, response, body) => {
    if (err) throw err
    const parsed = JSON.parse(body)
    const posts = parsed.data.children
    for (const raw_post of posts) {
      const post = raw_post.data
      if (check_post(post)) {

      }
    }
  })
}

function check_post(post) {
  return true
}
