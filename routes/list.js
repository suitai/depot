const express = require('express');
const router = express.Router();

const config = require('config');
const fs = require('fs');
const path = require('path');

const walk = (dir, option, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
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
            let result = {
              path: file,
              url: file,
              size: stat.size,
              mtime: stat.mtime
            };
            if ('baseDir' in option) {
              result.path = file.substr(option.baseDir.length + 1);
            }
            if ('baseUrl' in option) {
              result.url = option.baseUrl + result.path;
            }
            results.push(result);
            if (!--pending) done(null, results);
          }
        });
      }
    });
  });
};

/* GET home page. */
router.get('/', (req, res) => {
  const uploadDir = process.env.UPLOAD_DIR;
  const option = {
    baseDir: uploadDir,
    baseUrl: req.protocol + '://' + req.headers.host + process.env.DOWNLOAD_DIR + '/',
    exclude: config.get('List').exclude
  };
  walk(uploadDir, option, (err, list) => {
    if (err) throw err;
    res.send(list);
  });
});

module.exports = router;
