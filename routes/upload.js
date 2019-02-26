const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const child_process = require('child_process');

const uploadDir = process.env.UPLOAD_DIR
const tmpDir = path.join(uploadDir, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirsSync(tmpDir);
}
const upload = multer({ dest: tmpDir });

router.post('/', upload.array('file', 12), (req, res, next) => {
  const operates = config.get('Operate');
  const newdir = path.join(uploadDir, req.body.dir);
  console.log(`directory: ${req.body.dir}`);
  if (!fs.existsSync(newdir)) {
    fs.mkdirsSync(newdir);
  }
  req.files.forEach((file) => {
    const newpath = path.join(newdir, file.originalname);
    console.log(`file: ${newpath}`);
    fs.rename(file.path, newpath, (err) => {
      if (err) {
        console.error(`rename error: ${err}`);
        return;
      }
    });
    operates.forEach((operate) => {
      const match = file.originalname.match(operate.match)
      if (!match) {
        return;
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
        const renameStdout = child_process.execSync(`echo ${operate.rename}`, execOpt).toString();
        console.log(`rename: ${renameStdout}`);
        renameDir = path.join(newdir, path.dirname(renameStdout));
        if (!fs.existsSync(renameDir)) {
          fs.mkdirsSync(renameDir);
        }
        fs.rename(newpath, path.join(newdir, renameStdout), (err) => {
          if (err) {
            console.error(`rename error: ${err}`);
            return;
          }
        });
      }
      if ('post' in operate) {
        console.log(`post: ${operate.post}`);
        const postStdout = child_process.execSync(operate.post, execOpt).toString();
        console.log(`stdout: ${postStdout}`);
      }
    });
  });
  res.send('success!');
});

module.exports = router;
