var express = require('express');
var router = express.Router();

var multer = require('multer');
var fs = require('fs-extra');
var path = require('path');
var config = require('config');

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      var extension = path.extname(file.originalname);
      var filetype = 'Others';
      var filetypes = config.get('Filetype');
      for (key in filetypes) {
        console.log(filetypes[key]);
        if (filetypes[key].includes(extension)) {
          filetype = key;
        }
      }
      var dir = path.join('public/ftp', req.body.directory, filetype);
      if (!fs.existsSync(dir)) {
        fs.mkdirsSync(dir);
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
})

router.post('/', upload.array('file', 12), function(req, res, next) {
  res.json({ 'result': 'success!',
             'directory': req.body.directory,
             'tag': req.body.tag,
             'files': req.files });
});

module.exports = router;
