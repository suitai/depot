const express = require('express');
const router = express.Router();

const fs = require('fs-extra');
const path = require('path');

const queue = require('../lib/queue.js');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;
const listFile = path.join(uploadDir, '.cache', 'files.json');
const waitTime = 1000;

/* GET home page. */
router.get('/', (req, res) => {
  const baseUrl = req.protocol + '://' + req.headers.host + downloadDir + '/';
  fs.access(listFile, (err) => {
    if (err == null) {
      res.redirect(baseUrl + '.cache/files.json');
    } else {
      queue.file.push({'operate': {'create': 'fileList'}});
      console.log(`sleep: ${waitTime}`);
      setTimeout(() => {
        res.redirect(baseUrl + '.cache/files.json');
      }, waitTime);
    }
  });
});

module.exports = router;
