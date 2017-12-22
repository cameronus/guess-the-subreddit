const crypto = require('crypto')
const request = require('request')
const mongoose = require('mongoose')

const Post = require('../models/Post')

const min_score = 1500
const top_only = false
const approved_domains = ['i.imgur.com', 'i.redd.it']
const approved_ext = ['jpg', 'png', 'gif', 'jpeg', 'JPG', 'PNG']

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/guess-the-subreddit')

const subs = [
  'all', 'pics', 'hmmm',
  'interestingasfuck',
  'mildlyinteresting',
  'oddlysatisfying',
  'unexpected', 'dankmemes',
  'photoshopbattles', 'crappydesign',
  'nononono', 'nonononoyes',
  'yesyesyesno', 'anormaldayinrussia',
  'madlads', 'funny', 'aww', 'gifs',
  'earthporn', 'space', 'gadgets', 'sports',
  'food', 'dataisbeautiful', 'art', 'woahdude',
  'osha', 'techsupportgore', 'wellthatsucks',
  'wholesomememes', 'wtf', 'fellowkids',
  'ineeeedit', 'ofcoursethatsathing',
  'crappyoffbrands', 'blackpeopletwitter',
  'whitepeopletwitter', 'blackpeoplegifs',
  'whitepeoplegifs', 'pcmasterrace',
  'reallifedoodles', 'oopsdidntmeanto',
  'idiotsfightingthings', 'mademesmile',
  'therewasanattempt', 'hitmanimals',
  'prematurecelebration', 'mildlyinfuriating',
  'softwaregore', 'eyebleach', 'notmyjob',
  'quityourbullshit', 'youseeingthisshit',
  'thisismylifenow', 'holdmybeer', 'holdmycosmo',
  'im14andthisisdeep', 'gifsthatkeepongiving',
  'perfectloops', 'cinemagraphs', 'sweatypalms'
]

collect(50, subs)

function collect(pages, subs) {
  let ids = []
  Post.find({}, (err, posts) => {
    if (err) throw err
    for (const post of posts) {
      ids.push(post.id)
    }
    for (const sub of subs) {
      if (top_only) sub += '/top/'
      collect_posts(pages, sub, '', 0, ids, count => {
        console.log(`${count} posts added from r/${sub}.`)
      })
    }
  })
}

function collect_posts(pages, sub, after, count, ids, cb) {
  collect_from_page(sub, after, ids, (a, c) => {
    if (pages == 1) return cb(count + c)
    collect_posts(pages - 1, sub, a, count + c, ids, cb)
  })
}

function collect_from_page(sub, after, ids, cb) {
  if (after != '') after = '?after=' + after
  request(`https://www.reddit.com/r/${sub}.json${after}`, (err, response, body) => {
    if (err) throw err
    const parsed = JSON.parse(body).data
    const posts = parsed.children
    let count = 0
    for (const raw_post of posts) {
      const post = raw_post.data
      if (check_post(post, ids)) {
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

function check_post(post, ids) {
  return approved_domains.indexOf(post.domain) > -1 && approved_ext.indexOf(post.url.substring(post.url.length - 3)) > -1 && ids.indexOf(post.id) == -1 && !post.over_18 && post.score >= min_score
}
