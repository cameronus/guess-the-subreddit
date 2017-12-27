let img
let start_time
let gamemode
let wrapping = true

$(document).ready(() => {
  if (isMobile == true) return window.location.replace('mobile-error.html')
  update_leaderboard()
  document.getElementById('gameover-submit').style.display = 'none'
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
  $('#loading-container').show()
  gamemode = mode
  set_gamemode(mode, () => {
    get_challenge(() => {
      start_time = new Date()
      $('#loading-container').hide()
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
  $('#img, #title').css('filter', 'blur(10px)')
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
      if (response.title == null) document.getElementById('title').style.display = 'none'
      document.getElementById('title').innerHTML = response.title
      document.getElementById('title').title = response.title
      if (response.last) skip_answer(response.last)
      $('#img').one('load', () => {
        $('#img, #title').css('filter', 'blur(0px)')
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
      document.getElementById('gameover-submit').style.display = 'none'
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
  document.getElementById('focus-wrapper').style.display = 'none'
  document.getElementById('gameover').style.display = 'grid'
  $('#guess').blur()
  if (gamemode == 1) document.getElementById('gameover-submit').style.display = 'block'
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
  let seconds = Math.trunc(((new Date()).getTime() - start_time.getTime())/1000)
  $('#final-score').html(points)
  if (seconds >= 60) {
    document.getElementById('final-time').style.fontSize = "60px"
    document.getElementById('final-time').style.marginTop = "75px"
    document.getElementById('time-title').innerHTML = 'MINUTES'
    let minutes = Math.trunc(seconds / 60)
    seconds %= 60
    if (seconds < 10) $('#final-time').html(minutes + ':0' + seconds)
    else { $('#final-time').html(minutes + ':' + seconds) }
  }
  else {
    if (seconds == 1) document.getElementById('time-title').innerHTML = 'SECOND'
    $('#final-time').html(seconds)
  }
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

let isMobile = false
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true
