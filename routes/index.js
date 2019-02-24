const express = require('express');
const router = express.Router();

const config = require('config');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Depot',
    directory: config.get('Directory'),
    url: req.protocol + '://' + req.headers.host + req.url
  });
});

module.exports = router;
