let posts = []
let current = 0

$(document).ready(() => {
  // begin loading spinner
  $('#guess').hide()
  $('#check').hide()
  download((err, data) => {
    // end loading spinner
    if (err) {
      return alert('Error!')
    }
    posts = data
  })
})

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
  hash.update(input)
  const guess = hash.getHash('HEX').toLowerCase()
  if (actual_hash == guess) {
    alert('Correct!')
    display()
  } else {
    alert('Incorrect!')
  }
  $('#guess').val('')
}
