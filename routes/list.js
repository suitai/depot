const express = require('express');
const router = express.Router();

const config = require('config');

const search = require('../lib/search.js');

/* GET home page. */
router.get('/', (req, res) => {
  const uploadDir = process.env.UPLOAD_DIR;
  const option = {
    baseDir: uploadDir,
    baseUrl: req.protocol + '://' + req.headers.host + process.env.DOWNLOAD_DIR + '/',
    exclude: config.get('List').exclude
  };
  search.files(uploadDir, option, (err, list) => {
    if (err) throw err;
    res.send(list);
  });
});

module.exports = router;
