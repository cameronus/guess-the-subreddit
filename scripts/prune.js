const crypto = require('crypto')
const mongoose = require('mongoose')
const request = require('request')
const { exec } = require('child_process')
const cluster = require('cluster')

const Post = require('../models/Post')

const num_workers = 4

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/guess-the-subreddit')

if (cluster.isMaster) {
  Post.find({}, (err, posts) => {
    if (err) throw err
    const chunks = splitUp(posts, num_workers)
    for (const chunk of chunks) {
      const worker = cluster.fork()
      worker.send(chunk)
       worker.on('message', id => {
         console.log(id, 'being removed')
         Post.remove({ id: id }, (err, removed) => {
           console.log(id, 'successfully removed')
         })
       })
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
  exec(`curl -o /dev/null --silent --head --write-out '%{http_code}\n' ${post.url}`, (err, stdout, stderr) => {
    if (err) throw err
    console.log('checked', post.id)
    const code = stdout.trim()
    if (code == 404 || code == 302) {
      console.log(post.id, 'is missing -', posts.length, 'left')
      process.send(post.id)
    }
    check(posts)
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
