$(document).ready(() => {
  $('#guess').keypress((e) => {
  	if(e.keyCode == 13) guess()
  })
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
      $('#lives-number').html(response.lives)
      $('#score-number').html(response.score)
      if (response.lives == 0) return game_over()
      $('#expand').attr('href', response.url)
      $('#img').attr('src', response.url)
      $('#title-bg').attr('src', response.url)
      $('#title').html(response.title)
      $('#img').on('load', () => {
        $('#guess').focus()
        cb()
      })
    },
    error: err => {
      server_error(err)
    }
  })
}

function guess() {
  const subreddit = $('#guess').val()
  if (subreddit == '') return alert('please enter a guess')
  $.ajax({
    type: 'post',
    url: '/api',
    data: {
      subreddit: subreddit
    },
    success: response => {
      $('#guess').val('')
      $('#lives-number').html(response.lives)
      $('#score-number').html(response.score)
      if (response.lives == 0) return game_over()
      if (!response.correct) return alert('incorrect!')
      alert('correct!')
      get_challenge(() => {
        // console.log('next')
      })
    },
    error: err => {
      server_error(err)
    }
  })
}

function skip() {
  get_challenge(() => {
    // console.log('next')
  })
}

function game_over() {
  alert('game over!')
}

function server_error(err) {
  alert('server error!')
}
