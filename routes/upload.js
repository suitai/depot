var express = require('express');
var router = express.Router();

var multer = require('multer')
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/ftp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
})

router.post('/', upload.single('file'), function(req, res) {
  res.json({ 'result': 'success!',
             'tag': req.param('tag') });
});

module.exports = router;
