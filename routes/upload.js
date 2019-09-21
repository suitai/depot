const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

const queue = require('../lib/queue.js');

const uploadDir = process.env.UPLOAD_DIR;
const tmpDir = path.join(uploadDir, '.tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirsSync(tmpDir);
}
const upload = multer({ dest: tmpDir });

router.post('/', upload.array('file', 12), (req, res) => {
  const operates = config.get('Operate.Upload');
  req.files.forEach((file) => {
    let isMatch = false;
    for (let operate of operates) {
      let match = [];
      if ('match' in operate) {
        match = file.originalname.match(operate.match);
        if (!match) {
          continue;
        }
        isMatch = true;
      }
      queue.plugin.push({
        dest: req.body.dest,
        filename: file.originalname,
        filepath: file.path,
        operate: operate,
        match: match
      });
      if ('break' in operate) {
        if (operate.break) {
          break;
        }
      }
    }
  });
  res.format({
    text: () => {
      res.send('Upload Success!\n');
    },
    html: () => {
      res.render('success', {
        message: 'Upload Success!'
      });
    }
  });
});

module.exports = router;
