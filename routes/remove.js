const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const config = require('config');

const queue = require('../lib/queue.js');

const uploadDir = process.env.UPLOAD_DIR;

router.get('/', (req, res) => {
  const operates = config.get('Operate.Remove');
  const reqpath = req.query.path;
  const filepath = path.join(uploadDir, req.query.path);

  if (path.resolve(filepath).indexOf(path.resolve(uploadDir)) != 0 ) {
    res.send({error: `${reqpath} is Invalid.`});
  }
  if (!fs.existsSync(filepath)) {
    res.send({error: `${reqpath} Not Found.`});
  }
  if (fs.statSync(filepath).isDirectory()) {
    res.send({error: `${reqpath} is a directory.`});
  }

  let data = {
    filepath: filepath
  };
  console.log(`remove: ${JSON.stringify(data)}`);
  for (let operate of operates) {
    if ('match' in operate) {
      let match = [];
      match = reqpath.match(operate.match);
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
  res.format({
    text: () => {
      res.send(`${reqpath} Remove!\n`);
    },
    html: () => {
      res.render('success', {
        message: `${reqpath} Remove!`
      });
    }
  });
});

module.exports = router;
