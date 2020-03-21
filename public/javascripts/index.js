window.onload = function () {
  let app = new Vue({
    el: '#list',
    data: {
      list: [],
    },
    methods: {
      remove: (path => {
        axios
          .get('./remove', {
             params: {
               path: path
             }
          })
          .catch(error => (console.log(error)));
      })
    }
  });
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      axios
        .get('./list')
        .then(response => (app.list = response.data))
        .catch(error => (console.log(error)));
    }
  }, 3000);
};
