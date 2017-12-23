;let gamemode

var focus, img

$(document).ready(() => {
  $('#guess').keypress((e) => {
  	if(e.keyCode == 13) guess()
  })
  focus = document.getElementById('focus')
  img = document.getElementById('img')
})

function start(mode) {
  gamemode = mode
  get_challenge(() => {
    document.getElementById('start-wrapper').className = 'slide-left-out'
    setTimeout(() => {
      document.getElementById('start-wrapper').style.display = 'none'
      focus.className = 'slide-left-in'
      focus.style.display = 'block'
      document.getElementById('stats').style.display = 'block'
    }, 400)
  })
}

function get_challenge(cb) {
  // start loading
  $.ajax({
    type: 'get',
    url: '/api/post',
    success: response => {
      document.getElementById('lives-number').innerHTML = response.lives
      document.getElementById('score-number').innerHTML = response.score
      if (response.lives == 0) return game_over()
      document.getElementById('expand').href = response.url
      img.src = response.url
      document.getElementById('title-bg').src = response.url
      document.getElementById('stats-bg').src = response.url
      document.getElementById('nav-bg').src = response.url
      document.getElementById('title').innerHTML = response.title
      document.getElementById('title').title = response.title
      img.onload = function() {
        // end loading
        cb()
        $('#guess').focus()
        const element = $('#img').clone()
        element.css({ visibility: 'hidden' })
        $('body').append(element)
        const img_width = element.width()
        element.remove()

        document.getElementById('title-container').style.width = img_width - 24
      }
      img.onerror = function() {
        return server_error()
      }
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
      document.getElementById('guess').value = ''
      document.getElementById('lives-number').innerHTML = response.lives
      document.getElementById('score-number').innerHTML = response.score
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
  document.getElementById('skip').setAttribute('disabled', true)
  document.getElementById('check').setAttribute('disabled', true)
  focus.classList.remove('slide-left-in')
  focus.classList.add('slide-left-out')
  document.getElementById('gameover').classList.add('slide-left-in')
  document.getElementById('gameover').style.display = 'grid'
  setTimeout(() => {
    focus.style.display = 'none'
  }, 400)
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
