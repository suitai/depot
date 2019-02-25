const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const { exec } = require('child_process');

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
      if (file.originalname.match(operate.regex)) {
        const execOpt = {
          cwd: uploadDir,
          env: {
            filename: file.originalname,
            dir: newdir
          }
        };
        if ('rename' in operate) {
          exec(`echo ${operate.rename}`, execOpt, (err, stdout, stderr) => {
            if (err) {
              console.error(`exec error: ${err}`);
              return;
            }
            console.log(`rename: ${stdout}`)
            renameDir = path.dirname(stdout);
            if (!fs.existsSync(renameDir)) {
              fs.mkdirsSync(renameDir);
            }
            fs.rename(newpath, path.join(newdir, stdout), (err) => {
              if (err) {
                console.error(`rename error: ${err}`);
                return;
              }
            });
          });
        }
      }
    });
  });
  res.send('success!');
});

module.exports = router;
