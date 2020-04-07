const fs = require('fs');
const path = require('path');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;

const getResult = (file, stat, option) => {
  let result = {
    size: stat.size,
    mtime: stat.mtime
  };
  result.path = path.join(downloadDir, file.substr(uploadDir.length));
  result.dirname = result.path.match(/.*\//)[0];
  result.basename = result.path.replace(/.*\//, '');
  return result;
};

const isIgnore = (file, ignores) => {
  if (ignores == null) {
    return false;
  }
  for (let ignore of ignores) {
    if (file.match(ignore)) {
      return true;
    }
  }
  return false;
};

const walk = (dir, option, done) => {
  let results = [];

  if (!('ignore' in option)) {
    option.ignore = null;
  }
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      if (isIgnore(file, option.ignore)) {
        //console.log(`ignore: ${path.join(dir, file)}`);
        if (!--pending) done(null, results);
      } else {
        file = path.join(dir, file);
        fs.stat(file, (err, stat) => {
          if (stat && stat.isDirectory()) {
            walk(file, option, (err, res) => {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            let filename = path.basename(file);
            if (filename.match(option.filename)) {
              //console.log(`find: ${file}`);
              results.push(getResult(file, stat, option));
            }
            if (!--pending) done(null, results);
          }
        });
      }
    });
  });
};

module.exports = {files: walk};
