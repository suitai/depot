const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const childProcess = require('child_process');
const async = require('async');

const uploadDir = process.env.UPLOAD_DIR;
const tmpDir = path.join(uploadDir, '.tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirsSync(tmpDir);
}
const upload = multer({ dest: tmpDir });

const filemove = (oldpath, newpath, done) => {
  const newdir = path.dirname(newpath);
  if (!fs.existsSync(newdir)) {
    fs.mkdirsSync(newdir);
  }
  fs.rename(oldpath, newpath, (err) => {
    if (err) return done(err);
  });
};

const pluginQueue = async.queue((data, callback) => {
  const execOpt = {
    cwd: uploadDir,
    env: {
      dest: data.dest,
      filename: data.filename,
      filepath: path.relative(uploadDir, data.filepath),
      dirname: path.relative(uploadDir, path.dirname(data.filepath)),
      match_0: data.match[0],
      match_1: data.match[1]
    }
  };
  if ('rename' in data.operate) {
    let renamePath = childProcess.execSync(`echo ${data.operate.rename}`, execOpt).toString().trim();
    renamePath = path.join(uploadDir, renamePath);
    console.log(`rename: ${renamePath}`);
    filemove(data.filepath, renamePath, (err) => {
      console.error(`rename: ${err}`);
      callback(err);
    });
    execOpt.env.filepath = path.relative(uploadDir, renamePath);
    execOpt.env.dirname = path.relative(uploadDir, path.dirname(renamePath));
  }
  if ('post' in data.operate) {
    console.log(`post: ${data.operate.post}`);
    let postStdout = childProcess.execSync(data.operate.post, execOpt).toString().trim();
    postStdout = postStdout.replace(/\n/g, '\nstdout: ');
    console.log(`stdout: ${postStdout}`);
  }
  callback(null);
});

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
      pluginQueue.push({
        dest: req.body.dest,
        filename: file.originalname,
        filepath: file.path,
        operate: operate,
        match: match
      });
      if (!('break' in operate)) {
        break;
      } else {
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
