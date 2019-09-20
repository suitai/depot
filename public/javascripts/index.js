window.onload = function () {
  var app = new Vue({
    el: '#list',
    data: {
      list: [],
    },
    mounted () {
      axios
        .get('./list')
        .then(response => (this.list = response.data))
    }
  })
  setInterval(function () {
    if (document.visibilityState === 'visible') {
      axios
        .get('./list')
        .then(response => (app.list = response.data))
    }
  }, 3000);
}
