const express = require('express');
const router = express.Router();

const fs = require('fs-extra');
const config = require('config');
const path = require('path');

const search = require('../lib/search.js');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;
const cacheDir = path.join(uploadDir, '.cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirsSync(cacheDir);
}
const listFile = path.join(cacheDir, 'files.json')

/* GET home page. */
router.get('/', (req, res) => {
  const baseUrl = req.protocol + '://' + req.headers.host + downloadDir + '/';
  const option = {
    ignore: config.get('List').ignore
  };
  fs.stat(listFile, (err, stat) => {
    if (err == null) {
      res.redirect(baseUrl + '.cache/files.json')
    } else {
      search.files(uploadDir, option, (err, list) => {
        if (err) throw err;
        list.sort((a, b) => {
          if (a.path < b.path) return -1;
          if (a.path > b.path) return 1;
          return 0;
        });
        fs.writeFile(listFile, JSON.stringify(list, undefined, 4), 'utf8', (err) => {
          if (err) throw err;
        });
        res.send(list);
      });
    }
  });
});

module.exports = router;
