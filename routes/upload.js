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
  console.log(`directory: ${req.body.dir}`);
  const dir = path.join(uploadDir, req.body.dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirsSync(dir);
  }
  req.files.forEach((file) => {
    const newpath = path.join(dir, file.originalname);
    console.log(`file: ${newpath}`);
    fs.rename(file.path, newpath, (err) => {
      if (err) throw err;
    });
  });
  res.send('success!');
});

module.exports = router;
