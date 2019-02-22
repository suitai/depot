var express = require('express');
var router = express.Router();

var config = require('config');
var category = config.get('Category');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', category: category });
});

module.exports = router;
