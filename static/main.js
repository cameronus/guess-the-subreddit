let lives = 5
$(document).ready(() => {
  // begin loading spinner
  // $('#guess').hide()
  // $('#check').hide()
  // download((err, data) => {
  //   // end loading spinner
  //   if (err) {
  //     return alert('Error!')
  //   }
  //   posts = data
  // })
})

function start() {
  next_image(() => {
    $('#focus').show()
    $('#display').hide()
  })
}

function next_image(cb) {
  let src = 'https://i.imgur.com/elbxVTmh.jpg'
  $('#expand').attr('src', src)
  $('#img').attr('src', src)
  $('#title-bg').attr('src', src)
  $('#img').on('load', () => {
    cb()
  })
}

function guess() {
  //check guess, edit lives, return lives
}


function download(cb) {
  $.ajax({
    type: 'get',
    url: '/api',
    success: response => cb(null, response.data),
    error: error => cb(true, null)
  })
}

function display() {
  if (posts.length == 0) return alert('Still loading!')
  if (current == posts.length) return alert('Game over!')
  $('#img').attr('src', posts[current].url)
  // spinner for image loading?
  if (current == 0) {
    $('#display').html('Skip')
    $('#guess').show()
    $('#check').show()
  }
  current++
}

function verify() {
  const input = $('#guess').val()
  if (input == '') return alert('Enter a guess!')
  const actual_hash = posts[current - 1].subreddit
  const hash = new jsSHA('SHA-256', 'TEXT')
  hash.update(input.toLowerCase())
  const guess = hash.getHash('HEX')
  if (actual_hash == guess) {
    alert('Correct!')
    display()
  } else {
    alert('Incorrect!')
  }
  $('#guess').val('')
}
