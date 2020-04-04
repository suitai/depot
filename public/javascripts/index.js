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
        {text: 'Dirname', value: 'dirname'},
        {text: 'Name', value: 'basename'},
        {text: 'Bytes', value: 'size'},
        {text: 'Time', value: 'mtime'},
        {text: 'Remove', value: 'remove', sortable: false}
      ],
      fileList: [],
      confirmDialog: false,
      removePath: '',
      errorDialog: false,
      errorStatus: '',
      errorMessage: '',
    },
    methods: {
      resetUploadForm: function () {
        this.$refs.uploadForm.reset();
      },
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
          this.resetUploadForm();
        })
        .catch((error) => {
          this.uploadDialog = false;
          console.error('Error: ' + error.response.data);
          this.errorStatus = error.response.status;
          this.errorMessage = error.response.data;
          this.errorDialog = true;
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
            console.error('Error: ' + error.response.data);
            this.errorStatus = error.response.status;
            this.errorMessage = error.response.data;
            this.errorDialog = true;
          });
      },
      list: function () {
        axios
          .get('./list')
          .then((response) => {
            this.fileList = response.data;
          })
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
