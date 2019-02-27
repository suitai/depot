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

router.post('/', upload.array('file', 12), (req, res, next) => {
  const operates = config.get('Operate');
  req.files.forEach((file) => {
    for (operate of operates) {
      let match = new Array();
      if ('match' in operate) {
        match = file.originalname.match(operate.match);
        if (!match) {
          continue;
        }
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
      const newDir = path.join(uploadDir, req.body.dir);
      if ('rename' in operate) {
        const renamePath = childProcess.execSync(`echo ${operate.rename}`, execOpt).toString().trim();
        const renameDir = path.join(newDir, path.dirname(renamePath));
        if (!fs.existsSync(renameDir)) {
          fs.mkdirsSync(renameDir);
        }
        console.log(`rename: ${renamePath}`);
        fs.rename(file.path, path.join(newDir, renamePath), (err) => {
          if (err) {
            console.error(`rename error: ${err}`);
          }
        });
      } else {
        const newPath = path.join(newDir, file.originalname);
        if (!fs.existsSync(newDir)) {
          fs.mkdirsSync(newDir);
        }
        console.log(`file: ${newPath}`);
        fs.rename(file.path, newPath, (err) => {
          if (err) {
            console.error(`rename error: ${err}`);
          }
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
  });
  res.send('success!');
});

module.exports = router;
