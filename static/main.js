$(document).ready(() => {
  download((err, data) => {
    if (err) return alert('Error!')
    
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

function verify() {

}
