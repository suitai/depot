const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

const uploadDir = process.env.UPLOAD_DIR

router.get('/', (req, res, next) => {
  const reqpath = req.query.path;
  const filepath = path.join(uploadDir, req.query.path);
  const dirname = path.dirname(filepath);
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
  res.format({
    text: function(){
      res.send(`${reqpath} Remove!\n`);
    },
    html: function(){
      res.render('success', {
        message: `${reqpath} Remove!`
      });
    }
  });
});

module.exports = router;
