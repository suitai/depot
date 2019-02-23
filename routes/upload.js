var express = require('express');
var router = express.Router();

var multer = require('multer');
var fs = require('fs-extra');
var path = require('path');
var config = require('config');

const uploadDir = process.env.UPLOAD_DIR

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      var extension = path.extname(file.originalname);
      var filetype = 'Others';
      var filetypes = config.get('Filetype');
      for (type in filetypes) {
        if (filetypes[type]['extension'].includes(extension)) {
          filetype = type;
        }
      }
      var dir = path.join(uploadDir, req.body.directory, filetype);
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
