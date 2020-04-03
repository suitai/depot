window.onload = function () {
  new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
      tab: null,
      uploadDest: '',
      uploadFiles: [],
      fileListHeaders: [
        {text: 'Path', value: 'path'},
        {text: 'Bytes', value: 'size'},
        {text: 'Time', value: 'mtime'},
        {text: 'Remove', value: 'remove', sortable: false}
      ],
      fileList: [],
      confirmDialog: false,
      removePath: null,
    },
    methods: {
      upload: function () {
        let formData = new FormData();
        formData.set('dest', this.uploadDest);
        for (let file of this.uploadFiles) {
          formData.append('file', file);
        }
        axios.post('./upload', formData, { headers: {
          'Content-Type': 'multipart/form-data'
        }})
        .then(response => (console.log(response)))
        .catch(error => (console.log(error)));
      },
      confirmRemove: function (path) {
        this.removePath = path;
        this.confirmDialog = true;
      },
      remove: function (path) {
        axios
          .get('./remove', {
             params: {
               path: path
             }
          })
          .catch(error => (console.log(error)));
        setTimeout(() => {
          this.confirmDialog = false;
        }, 1000);
      },
      list: function () {
        axios
          .get('./list')
          .then(response => (this.fileList = response.data))
          .catch(error => (console.log(error)));
      },
      repeat: function (repeatFunc) {
        setInterval(function () {
          if (document.visibilityState === 'visible') {
            repeatFunc();
          }
        }, 3000);
      }
    },
    mounted () {
      this.list();
      this.repeat(this.list);
    }
  });
};
