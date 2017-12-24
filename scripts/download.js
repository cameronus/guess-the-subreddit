const crypto = require('crypto')
const mongoose = require('mongoose')
const request = require('request')
const { exec } = require('child_process')
const cluster = require('cluster')
const path = require('path')
const fs = require('fs')
const dir = path.join(__dirname, '../static/posts') + '/'

const Post = require('../models/Post')

const num_workers = 4

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/guess-the-subreddit')

if (cluster.isMaster) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  Post.find({}, (err, posts) => {
    if (err) throw err
    const chunks = splitUp(posts, num_workers)
    for (const chunk of chunks) {
      const worker = cluster.fork()
      worker.send(chunk)
    }
  })
} else {
  process.on('message', chunk => {
    console.log('Worker handling chunk with size of', chunk.length)
    check(chunk)
  })
}

function check(posts) {
  if (posts.length == 0) return console.log('done')
  const post = posts.shift()
  const id_hash = crypto.createHash('sha256').update(post.id).digest('hex')
  const file_ext = path.extname(post.url)
  fs.stat(dir + id_hash + file_ext, (err, stat) => {
    if (err != null) {
      const cmd = `wget ${post.url} -O ${dir}${id_hash}${file_ext}`
      console.log('downloading', post.id, 'with', cmd)
      exec(cmd, (err, stdout, stderr) => {
        if (err) throw err
        console.log('downloaded', post.id)
        check(posts)
      })
    } else {
      console.log(post.id, 'already exists')
      check(posts)
    }
  })
}

function splitUp(arr, n) {
    let rest = arr.length % n, // how much to divide
        restUsed = rest, // to keep track of the division over the elements
        partLength = Math.floor(arr.length / n),
        result = []
    for(let i = 0; i < arr.length; i += partLength) {
        let end = partLength + i,
            add = false
        if(rest !== 0 && restUsed) { // should add one element for the division
            end++
            restUsed-- // we've used one division element now
            add = true
        }
        result.push(arr.slice(i, end)) // part of the arra
        if(add) {
            i++ // also increment i in the case we added an extra element for division
        }
    }
    return result
}
