const fs = require('fs');
const path = require('path');

const getResult = (file, stat, option)=> {
  let result = {
    path: file,
    url: file,
    size: stat.size,
    mtime: stat.mtime
  };
  if ('baseDir' in option) {
    result.path = file.substr(option.baseDir.length + 1);
  }
  if ('baseUrl' in option) {
    result.url = option.baseUrl + result.path;
  }
  return result;
};

const walk = (dir, option, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      if (option.ignore.includes(file)) {
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
            let result = getResult(file, stat, option);
            if (result) {
              results.push(result);
            }
            if (!--pending) done(null, results);
          }
        });
      }
    });
  });
};

module.exports = {files: walk};
