download()

function download() {
  $.ajax({
    type: 'get',
    url: '/api',
    success: response => {
      console.log(response)
    },
    error: error => console.error(error)
  })
}

function verify() {

}
