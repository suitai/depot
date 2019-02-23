const express = require('express');
const router = express.Router();

const config = require('config');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express', directory: config.get('Directory') });
});

module.exports = router;
