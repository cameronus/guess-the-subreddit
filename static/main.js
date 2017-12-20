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
      if (!response.title || !response.url) return update_scoring(response)
      $('#expand').attr('href', response.url)
      $('#img').attr('src', response.url)
      $('#title-bg').attr('src', response.url)
      $('#title').html(response.title)
      $('#lives-number').html(response.lives)
      $('#score-number').html(response.score)
      if (response.lives == 0) return game_over()
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
    error: error => {
      // error!
    }
  })
}

function skip() {
  get_challenge(() => {
    // console.log('next')
  })
}

function update_scoring(response) {
  $('#lives-number').html(response.lives)
  $('#score-number').html(response.score)
  if (response.lives == 0) return alert('game over!')
  if (response.correct != null && response.correct == true) return alert('correct!')
  if (response.correct != null && response.correct == false) return alert('wrong!')
}

function game_over() {
  alert('game over!')
}
