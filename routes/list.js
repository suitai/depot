const express = require('express');
const router = express.Router();

const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const childProcess = require('child_process');

const queue = require('../lib/queue.js');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;

/* GET home page. */
router.get('/', (req, res) => {
  const listConfig = config.get('List');
  let basedir = '';
  if ('base' in req.query) {
    basedir = req.query.base;
  }
  let execOpt = {env: {basedir: basedir}};
  const listPath = childProcess.execSync(`echo ${listConfig.path}`, execOpt).toString().trim();
  const listUrl = req.protocol + '://' + req.headers.host + downloadDir + '/' + listPath;
  const listFile = path.join(uploadDir, listPath);
  const waitTime = 1000;

  fs.access(listFile, (err) => {
    if (err == null) {
      res.redirect(listUrl);
    } else {
      let data = {
        basedir: basedir,
        operate: {
          create: listConfig.create
        }
      };
      console.log(`push: ${JSON.stringify(data.operate)}`);
      queue.file.push(JSON.parse(JSON.stringify(data)));
      queue.file.push(data);
      setTimeout(() => {
        res.redirect(listUrl);
      }, waitTime);
    }
  });
});

module.exports = router;
