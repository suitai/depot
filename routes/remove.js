const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const config = require('config');

const queue = require('../lib/queue.js');
const util = require('../lib/util.js');

const uploadDir = process.env.UPLOAD_DIR;

router.get('/', (req, res) => {
  const operates = config.get('Operate.Remove');
  let filepath = util.convert.path(req.query.path);
  let realpath = path.join(uploadDir, filepath);
  let basedir = '';
  if ('base' in req.query) {
    basedir = req.query.base;
  }

  if (!util.check.path(realpath)) {
    console.log(`${req.query.path} is Invalid.`);
    res.status(400).send(`${req.query.path} is Invalid.`);
    return;
  }

  if (!fs.existsSync(realpath)) {
    console.log(`${req.query.path} Not Found.`);
    res.status(400).send(`${req.query.path} Not Found.`);
    return;
  }
  if (fs.statSync(realpath).isDirectory()) {
    console.log(`${req.query.path} is a directory.`);
    res.status(400).send(`${req.query.path} is a directory.`);
    return;
  }

  let data = {
    basedir: basedir,
    filepath: filepath
  };
  console.log(`remove: ${JSON.stringify(data)}`);
  for (let operate of operates) {
    if ('match' in operate) {
      let match = [];
      match = req.query.path.match(operate.match);
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
  res.send(`${req.query.path} Remove!\n`);
});

module.exports = router;
