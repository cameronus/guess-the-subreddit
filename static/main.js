let posts = []
let current = 0

$(document).ready(() => {
  // begin loading spinner
  $('#guess').hide()
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
  if (current == 0) $('#button').html('Next')
  current++
}

function verify() {
  if (posts[current - 1] == (new jsSHA('SHA-256', 'TEXT')).update($('#guess').val()).getHash('HEX')) {

  } else {

  }
}
