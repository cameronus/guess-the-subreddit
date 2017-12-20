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
  const subreddit = $('#guess').val()
  if (subreddit == '') return alert('please enter a guess')
  $.ajax({
    type: 'post',
    url: '/api',
    data: {
      subreddit: subreddit
    },
    success: response => {
      $('#lives-number').html(response.lives)
      $('#score-number').html(response.score)
      $('#guess').val('')
      if (response.end) return alert('game over') // oh no! reset game route
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

function skip() {

}
