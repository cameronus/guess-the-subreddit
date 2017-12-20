let score = 0
let lives = 10

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
  get_challenge(() => {
    $('#focus').show()
    $('#stats').show()
    $('#display').hide()
  })
}

function get_challenge(cb) {
  $.ajax({
    type: 'get',
    url: '/api',
    success: response => {
      $('#expand').attr('href', response.url)
      $('#img').attr('src', response.url)
      $('#title-bg').attr('src', response.url)
      $('#title').html(response.title)
      $('#img').on('load', () => {
        $('#guess').focus()
        cb()
      })
    },
    error: error => {
      // error!
    }
  })
}

function guess() {
  $.ajax({
    type: 'post',
    url: '/api',
    data: {
      subreddit: $('#guess').val()
    },
    success: response => {
      $('#lives-number').html(response.lives)
      $('#score-number').html(response.score)
      $('#guess').val('')
      if (response.lost) return alert('game over') // oh no! reset game route
      if (!response.correct) return alert('incorrect') // oh no! display error toast
      alert('correct!')
      get_challenge(() => {
        console.log('next')
      })
    },
    error: error => {
      // error!
    }
  })
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
