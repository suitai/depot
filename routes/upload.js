const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

const queue = require('../lib/queue.js');
const util = require('../lib/util.js');

const uploadDir = process.env.UPLOAD_DIR;
const tmpDir = path.join(uploadDir, '.upload');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirsSync(tmpDir);
}
const upload = multer({ dest: tmpDir });

router.post('/', upload.array('file', 12), (req, res) => {
  const operates = config.get('Operate.Upload');
  let destpath = util.convert.path(req.body.dest);

  if (!util.check.path(destpath)) {
    console.log(`${req.body.dest} is Invalid.`);
    res.status(400).send(`${req.body.dest} is Invalid.`);
    req.files.forEach((file) => {
      queue.file.push({'operate': {'unlink': file.path}});
    });
    return;
  }

  req.files.forEach((file) => {
    let data = {
      dest: destpath,
      filename: file.originalname,
      filepath: file.path
    };
    console.log(`upload: ${JSON.stringify(data)}`);
    for (let operate of operates) {
      if ('match' in operate) {
        let match = [];
        match = file.originalname.match(operate.match);
        if (!match) {
          continue;
        }
        data.match = match;
      }
      data.operate = operate;
      console.log(`push: ${JSON.stringify(operate)}`);
      queue.file.push(JSON.parse(JSON.stringify(data)));
      if ('break' in operate) {
        if (operate.break) {
          break;
        }
      }
    }
  });
  res.send('Upload Success!\n');
});

module.exports = router;
