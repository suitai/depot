const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

const uploadDir = process.env.UPLOAD_DIR

router.get('/', (req, res, next) => {
  const reqpath = req.query.path;
  const filepath = path.join(uploadDir, req.query.path);
  const dirname = path.dirname(filepath);
  if (!fs.existsSync(filepath)) {
    res.format({
      text: function(){
        res.send(`${reqpath} Not Found!\n`);
      }
    });
  }
  if (!fs.statSync(filepath).isFile()) {
    res.format({
      text: function(){
        res.send(`${reqpath} is Not File!\n`);
      }
    });
  }
  fs.unlink(filepath, (err) => {
    console.error(`remove error: ${err}`);
  });
  res.format({
    text: function(){
      res.send(`${reqpath} Remove!\n`);
    }
  });
});

module.exports = router;
