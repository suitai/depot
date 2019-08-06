window.onload = function () {
  new Vue({
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
}
