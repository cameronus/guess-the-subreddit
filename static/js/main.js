let img
let start_time
let gamemode
let wrapping = true

$(document).ready(() => {
  update_leaderboard()
  $('#gameover-submit').hide()
  $('#guess').keypress((e) => {
  	if(e.keyCode == 13) guess()
  })
  $('#name-input').keypress((e) => {
  	if(e.keyCode == 13) send_score()
  })
  img = document.getElementById('img')
})

function update_leaderboard() {
  $.ajax({
    type: 'get',
    url: '/api/leaderboard',
    success: response => {
      let rank = 1
      for (const score of response) {
        const row ='<tr><td class="player-rank">' + rank + '</td><td class="player-username">' + score.username + '</td><td class="player-points">' + score.score + '</td></tr>'
        $('#leaderboard-table').append(row)
        rank++
      }
    },
    error: err => server_error(err)
  })
}

function start(mode) {
  gamemode = mode
  set_gamemode(mode, () => {
    get_challenge(() => {
      start_time = new Date()
      $('#start-wrapper').hide()
    })
  })
}

function set_gamemode(mode, cb) {
  $.ajax({
    type: 'post',
    url: '/api/gamemode',
    data: {
      gamemode: mode
    },
    success: response => {
      cb()
    },
    error: err => server_error(err)
  })
}

function get_challenge(cb) {
  // start loading
  $.ajax({
    type: 'get',
    url: '/api/question',
    success: response => {
      $('#lives-number').html(response.lives)
      $('#score-number').html(response.score)
      if (response.lives == 0) return game_over()
      document.getElementById('expand').href = response.url
      img.src = response.url
      document.getElementById('title-bg').src = response.url
      document.getElementById('stats-bg').src = response.url
      if (response.title == null) $('#title').hide()
      document.getElementById('title').innerHTML = response.title
      document.getElementById('title').title = response.title
      if (response.last) skip_answer(response.last)
      $('#img').one('load', () => {
        // end loading
        cb()
        document.getElementById('title').style.whiteSpace = 'nowrap'
        document.getElementById('img').style.maxHeight = 'calc(80vh - 140px)';
        $('#guess').focus()
        const element = $('#img').clone()
        element.css({ visibility: 'hidden' })
        $('body').append(element)
        const img_width = element.width()
        element.remove()
        $('#title').width(img_width - 30)
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
    url: '/api/question',
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

//Sends player score to leaderboard
function send_score() {
  const username = $('#name-input').val()
  $('#name-input').val('')
  $.ajax({
    type: 'post',
    url: '/api/leaderboard',
    data: {
      username: username
    },
    success: response => {
      $('#name-input').blur()
      $('#gameover-submit').hide()
    },
    error: err => server_error(err)
  })
}

//Displays a notification prompting the user to enter guess when input is empty
function enter_guess() {
  iziToast.error({
      id: 'error',
      title: 'Error',
      message: 'Please enter a guess',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

//Displays a notification upon an incorrect response
function incorrect() {
  iziToast.warning({
      id: 'warning',
      title: 'Incorrect',
      message: 'Please guess again!',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

//Displays a notification upon a correct response
function correct() {
  iziToast.success({
      id: 'success',
      title: 'Correct',
      message: 'That answer was correct!',
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

//Displays the correct answer after skipping
function skip_answer(subreddit) {
  iziToast.info({
      id: 'info',
      title: 'Answer',
      message: 'The answer was r/' + subreddit,
      position: 'topRight',
      transitionIn: 'fadeInDown'
  })
}

//Gameover screen. Retrieves and displays stats
function game_over() {
  $('#focus-wrapper').hide()
  $('gameover').show()
  $('#guess').blur()
  if (gamemode == 1) $('#gameover-submit').show()
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
  $('#final-score').html(points)
  const seconds = Math.trunc(((new Date()).getTime() - start_time.getTime())/1000)
  $('#final-time').html(seconds)
}


//Displays a notification upon server error
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

//Toggles title expansion between full view and collapsing
function expand_title() {
  if ($('#title')[0].scrollWidth > $('#title').width() && wrapping) {
    let title_height = $('#title-bar').height()
    document.getElementById('title').style.whiteSpace = 'normal'
    let current_title_height = $('#title-bar').height(),
    title_height_dif = current_title_height - title_height,
    img_height = document.getElementById('img').offsetHeight - title_height_dif
    document.getElementById('img').style.maxHeight = img_height + 'px'
    wrapping = false
  }
  else {
    document.getElementById('title').style.whiteSpace = 'nowrap'
    document.getElementById('img').style.maxHeight = 'calc(80vh - 140px)'
    wrapping = true
  }
  console.log(wrapping)
}
