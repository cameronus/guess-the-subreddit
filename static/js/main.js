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
  // start loading
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
        // end loading
        cb()
      })
    },
    error: err => server_error(err)
  })
}

function guess() {
  const subreddit = $('#guess').val()
  if (subreddit == '') return enter_guess()
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
      if (!response.correct) return incorrect()
      correct()
      get_challenge(() => {

      })
    },
    error: err => server_error(err)
  })
}

function skip() {
  get_challenge(() => {

  })
}

function enter_guess() {
  iziToast.warning({
      id: 'warning',
      title: 'Enter a Guess',
      message: 'Please enter a guess and try again.',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

function incorrect() {
  iziToast.warning({
      id: 'warning',
      title: 'Incorrect',
      message: 'Please try again!',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

function correct() {
  iziToast.success({
      id: 'success',
      title: 'Correct',
      message: 'That answer was correct!',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

function game_over() {
  iziToast.error({
      id: 'error',
      title: 'Game Over',
      message: 'You have exhausted your lives.',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

function server_error(err) {
  iziToast.error({
      id: 'error',
      title: 'Server Error',
      message: 'Please reload the page.',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}
