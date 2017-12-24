let gamemode

let img

$(document).ready(() => {
  $('#guess').keypress((e) => {
  	if(e.keyCode == 13) guess()
  })
  img = document.getElementById('img')
})

function requestFullScreen() {
  const el = document.documentElement
  const requestMethod = el.requestFullScreen || el.webkitRequestFullScreen
  || el.mozRequestFullScreen || el.msRequestFullScreen
  if (requestMethod) {
    requestMethod.call(el)
  } else if (typeof window.ActiveXObject !== "undefined") {
    const wscript = new ActiveXObject("WScript.Shell")
    if (wscript !== null) {
      wscript.SendKeys("{F11}")
    }
  }
}

function start(mode) {
  gamemode = mode
  get_challenge(() => {
    $('#start-wrapper').hide()
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
      document.getElementById('expand').href = response.url
      img.src = response.url
      document.getElementById('title-bg').src = response.url
      document.getElementById('stats-bg').src = response.url
      document.getElementById('title').innerHTML = response.title
      document.getElementById('title').title = response.title
      $('#img').one('load', () => {
        // end loading
        cb()
        $('#guess').focus()
        const element = $('#img').clone()
        element.css({ visibility: 'hidden' })
        $('body').append(element)
        const img_width = element.width()
        element.remove()

        $('#title').width(img_width - 24)
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
  $('#focus-wrapper').hide()
  $('gameover').show()
  $('#guess').blur()
  iziToast.error({
      id: 'error',
      title: 'Game Over',
      message: 'You have exhausted your lives.',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
  const points = $('#score-number').html()
  document.getElementById('skip').setAttribute('disabled', true)
  document.getElementById('check').setAttribute('disabled', true)
  document.getElementById('final-score').innerHTML = points
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
