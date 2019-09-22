const express = require('express');
const router = express.Router();

const ejs = require('ejs');
const path = require('path');

const search = require('../lib/search.js');

/* GET home page. */
router.get('/yum.repo', (req, res) => {
  const uploadDir = process.env.UPLOAD_DIR;
  const option = {
    filename: 'repomd.xml'
  };
  let repos = [];
  search.files(uploadDir, option, (err, list) => {
    if (err) throw err;
    list.forEach((file) => {
      let repo = {
        title: process.env.TITLE,
        base: req.protocol + '://' + req.headers.host + process.env.DOWNLOAD_DIR,
        name: path.basename(path.join(file.path, '..', '..')), 
        dir: path.relative(uploadDir, path.join(file.path, '..', '..'))
      };
      console.log(repo);
      repos.push(repo);
    });
    console.log(repos);
    ejs.renderFile('./templates/yum.repo.ejs', {
      repos: repos
    }, (err, data) => {
      console.log(data);
      res.send(err || data);
    });
  });
});

module.exports = router;
