const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const childProcess = require('child_process');

const uploadDir = process.env.UPLOAD_DIR
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
}

router.post('/', upload.array('file', 12), (req, res, next) => {
  const operates = config.get('Operate');
  req.files.forEach((file) => {
    let isMatch = false;
    const newDir = path.join(uploadDir, req.body.dir);
    const newPath = path.join(newDir, file.originalname);
    for (operate of operates) {
      let match = new Array();
      if ('match' in operate) {
        match = file.originalname.match(operate.match);
        if (!match) {
          continue;
        }
        isMatch = true;
      }
      const execOpt = {
        cwd: uploadDir,
        env: {
          filename: file.originalname,
          dir: req.body.dir,
          dir_0: req.body.dir.split(path.sep)[0],
          match_1: match[1]
        }
      };
      if ('rename' in operate) {
        let renamePath = childProcess.execSync(`echo ${operate.rename}`, execOpt).toString().trim();
        renamePath = path.join(newDir, renamePath);
        console.log(`rename: ${renamePath}`);
        filemove(file.path, renamePath, (err) => {
            console.error(`rename error: ${err}`);
        });
      } else {
        console.log(`file: ${newPath}`);
        filemove(file.path, newPath, (err) => {
            console.error(`rename error: ${err}`);
        });
      }
      if ('post' in operate) {
        console.log(`post: ${operate.post}`);
        const postStdout = childProcess.execSync(operate.post, execOpt).toString().trim();
        console.log(`stdout: ${postStdout}`);
      }
      if ('break' in operate) {
        if (operate.break) {
          console.log('break');
          break;
        }
      }
    }
    if (!isMatch) {
      console.log(`file: ${newPath}`);
      filemove(file.path, newPath, (err) => {
          console.error(`rename error: ${err}`);
      });
    }
  });
  res.format({
    text: function(){
      res.send('Upload Success!\n');
    },
    html: function(){
      res.render('success', {
        message: 'Upload Success!'
      });
    }
  });
});

module.exports = router;
