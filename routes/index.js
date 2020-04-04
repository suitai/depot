const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', {
    title: process.env.TITLE,
    download: process.env.DOWNLOAD_DIR,
    url: req.protocol + '://' + req.headers.host + req.url
  });
});

module.exports = router;
