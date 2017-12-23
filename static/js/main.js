let gamemode

$(document).ready(() => {
  $('#guess').keypress((e) => {
  	if(e.keyCode == 13) guess()
  })
})

function start(mode) {
  gamemode = mode
  get_challenge(() => {
    $('#start-wrapper').addClass('slide-left-out')
    setTimeout(() => {
      $('#start-wrapper').hide()
      $('#focus').addClass('slide-left-in')
      $('#focus').show()
      $('#stats').show()
    }, 300)
  })
}

function get_challenge(cb) {
  // start loading
  $.ajax({
    type: 'get',
    url: '/api/post',
    success: response => {
      $('#lives-number').html(response.lives)
      $('#score-number').html(response.score)
      if (response.lives == 0) return game_over()
      $('#expand').attr('href', response.url)
      $('#img').attr('src', response.url)
      $('#title-bg').attr('src', response.url)
      $('#stats-bg').attr('src', response.url)
      $('#nav-bg').attr('src', response.url)
      $('#title').html(response.title)
      $('#title').prop('title', response.title)
      $('#img').one('load', () => {
        // end loading
        cb()
        $('#guess').focus()
        const element = $('#img').clone()
        element.css({ visibility: 'hidden' })
        $('body').append(element)
        const img_width = element.width()
        element.remove()

        $('#title-container').width(img_width - 24)
      })
      $('#img').one('error', () => {
        return server_error()
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
    url: '/api/post',
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
  iziToast.error({
      id: 'error',
      title: 'Error',
      message: 'Please enter a guess',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

function incorrect() {
  iziToast.warning({
      id: 'warning',
      title: 'Incorrect',
      message: 'Please guess again!',
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
  const points = $('#score-number').html()
  $('#guess').blur()
  $('#skip').prop('disabled', true)
  $('#check').prop('disabled', true)
  $('#focus').removeClass('slide-left-in')
  $('#focus').addClass('slide-left-out')
  $('#gameover').addClass('slide-left-in')
  $('#gameover').show()
  setTimeout(() => {
    $('#focus').hide()
    $('#gameover').css("display", "grid")
  }, 300)
}

function server_error(err) {
  iziToast.error({
      id: 'error',
      title: 'Server Error',
      message: 'Reloading the page.',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
  setTimeout(() => {
    window.location.reload(false)
  }, 1500)
}
