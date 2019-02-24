const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const { exec } = require('child_process');

const uploadDir = process.env.UPLOAD_DIR
const filetypes = config.get('Filetype');
let typeSet = new Set();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      let filetype = 'Others';
      for (type in filetypes) {
        if (filetypes[type]['extension'].includes(extension)) {
          filetype = type;
          typeSet.add(type);
        }
      }
      console.log(`filetype: ${filetype}`);
      const dir = path.join(uploadDir, filetype, req.body.dir);
      if (!fs.existsSync(dir)) {
        fs.mkdirsSync(dir);
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  })
})

router.post('/', upload.array('file', 12), (req, res, next) => {
  console.log(`directory: ${req.body.dir}`);
  req.files.forEach((file) => {
    console.log(`file: ${file.path}`);
  });
  typeSet.forEach((type) => {
    const execOpt = {cwd: uploadDir, env: {repodir: path.join(type, req.body.dir.split(path.sep)[0])}};
    if ('script' in filetypes[type]) {
      console.log(`exec: ${filetypes[type]['script']}`)
      exec(filetypes[type]['script'], execOpt, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
    }
  });
  typeSet.clear();
  res.send('success!');
});

module.exports = router;
