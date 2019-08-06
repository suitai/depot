window.onload = function () {
  new Vue({
    el: '#list',
    data: {
      list: [],
      appName: 'The name of some other app'
    },
    created () {
      console.log(this.appName)
    },
    mounted () {
      axios
        .get('./list')
        .then(response => (this.list = response.data))
    }
  })
}
