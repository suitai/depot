const path = require('path');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;

const convertPath = ((reqPath) => {
  let newPath = reqPath;
  let delPath = downloadDir;

  if (newPath.indexOf('/') == 0) {
    newPath = newPath.substr(1);
  }
  if (delPath.indexOf('/') == 0) {
    delPath = delPath.substr(1);
  }

  if (newPath.indexOf(delPath) == 0) {
      newPath = newPath.substr(delPath.length);
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
