const express = require('express');
const router = express.Router();

const config = require('config');
const fs = require('fs');
const path = require('path');

const Title = process.env.TITLE

const walk = (dir, option, done) => {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      if (option.exclude.includes(file)) {
        if (!--pending) done(null, results);
      } else {
        file = path.join(dir, file);
        fs.stat(file, (err, stat) => {
          if (stat && stat.isDirectory()) {
            walk(file, option, (err, res) => {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            if ('baseDir' in option) {
              file = file.substr(option.baseDir.length + 1);
            }
            results.push(file);
            if (!--pending) done(null, results);
          }
        });
      }
    });
  });
};

/* GET home page. */
router.get('/', (req, res, next) => {
  const uploadDir = process.env.UPLOAD_DIR;
  const option = {
    baseDir: uploadDir,
    exclude: config.get('List').exclude
  }
  walk(uploadDir, option, (err, list) => {
    if (err) throw err;
    res.render('index', {
      title: Title,
      download: process.env.DOWNLOAD_DIR,
      directory: config.get('Directory'),
      url: req.protocol + '://' + req.headers.host + req.url,
      list: list
    });
  });
});

module.exports = router;
