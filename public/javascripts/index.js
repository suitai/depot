window.onload = function () {
  new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
      tab: null,
      uploadDest: '',
      uploadFiles: [],
      uploadDialog: false,
      uploadPercentage: 0,
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
        this.uploadPercentage = 0;
        this.uploadDialog = true;

        let formData = new FormData();
        formData.set('dest', this.uploadDest);
        for (let file of this.uploadFiles) {
          formData.append('file', file);
        }

        let config = {
          headers: {'Content-Type': 'multipart/form-data'},
          onUploadProgress: function( progressEvent ) {
            this.uploadPercentage = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          }.bind(this)
        };

        axios.post('./upload', formData, config)
        .then((response) => {
          this.uploadDialog = false;
          console.log(response);
        })
        .catch((error) => {
          this.uploadDialog = false;
          console.log(error);
        });
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
          .then((response) => {
            this.confirmDialog = false;
            console.log(response);
          })
          .catch(error => {
            this.confirmDialog = false;
            console.log(error);
          });
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
