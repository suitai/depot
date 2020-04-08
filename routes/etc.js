const express = require('express');
const router = express.Router();

const ejs = require('ejs');
const path = require('path');

const search = require('../lib/search.js');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;

/* GET home page. */
router.get('/yum.repo', (req, res) => {
  const option = {
    filename: 'repomd.xml'
  };
  let repos = [];
  search.files(uploadDir, option, (err, list) => {
    if (err) throw err;
    list.forEach((file) => {
      let filepath = path.join(uploadDir, file.path.substr(downloadDir.length));
      let relativePath = path.relative(uploadDir, path.join(filepath, '..', '..'));
      let repo = {
        title: process.env.TITLE,
        base: req.protocol + '://' + req.headers.host + downloadDir,
        name: relativePath.replace(/\//g, '-'),
        dir: relativePath
      };
      repos.push(repo);
    });
    console.log(`repos: ${JSON.stringify(repos)}`);
    ejs.renderFile('./templates/yum.repo.ejs', {
      repos: repos
    }, (err, data) => {
      res.send(err || data);
    });
  });
});

module.exports = router;
