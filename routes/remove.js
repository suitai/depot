const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const config = require('config');
const childProcess = require('child_process');

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
  fs.unlink(filepath, (err) => {
    if (err) {
      console.error(`remove error: ${err}`);
    }
  });

  for (let operate of operates) {
    let match = [];
    if ('match' in operate) {
      match = reqpath.match(operate.match);
      if (!match) {
        continue;
      }
      isMatch = true;
    }
    let execOpt = {
      cwd: uploadDir,
      env: {
        filepath: reqpath,
        dirname: path.dirname(reqpath),
        match_0: match[0],
        match_1: match[1]
      }
    };
    if ('post' in operate) {
      console.log(`post: ${operate.post}`);
      let postStdout = childProcess.execSync(operate.post, execOpt).toString().trim();
      postStdout = postStdout.replace(/\n/g, '\nstdout: ');
      console.log(`stdout: ${postStdout}`);
    }
    if (!('break' in operate)) {
      break;
    } else {
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
