const path = require('path');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;

const convertPath = ((reqPath) => {
  let newPath = '';

  if (reqPath.indexOf('/') == 0) {
    newPath = reqPath;
  } else {
    newPath = '/' + reqPath;
  }

  if (newPath.indexOf(downloadDir) == 0) {
      newPath = path.join(uploadDir, newPath.substr(downloadDir.length));
  } else {
      newPath = path.join(uploadDir, newPath);
  }
  return newPath;
});

const checkPath = ((reqPath) => {
  if (path.resolve(reqPath).indexOf(path.resolve(uploadDir)) != 0 ) {
    return false;
  } else {
    return true;
  }
});

module.exports = {convert: {path: convertPath}, check: {path: checkPath}};
