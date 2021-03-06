const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

const config = require('config');
const search = require('../lib/search.js');

const uploadDir = process.env.UPLOAD_DIR;
const cacheDir = path.join(uploadDir, '.cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirsSync(cacheDir);
}
const listFile = path.join(cacheDir, 'files.json')

const move = (oldpath, newpath, done) => {
  const newdir = path.dirname(newpath);
  if (!fs.existsSync(newdir)) {
    fs.mkdirsSync(newdir);
  }
  fs.rename(oldpath, newpath, (err) => {
    if (err) return done(err);
  });
};

const remove = (path, done) => {
  fs.unlink(path, (err) => {
    if (err) return done(err);
  });
};

const setEnv = (data) => {
  let env = {};
  if ('filepath' in data) {
      env.filepath = data.filepath;
      env.dirname = path.dirname(data.filepath);
  }
  if ('dest' in data) {
    env.dest = data.dest;
  }
  if ('filename' in data) {
    env.filename = data.filename;
  }
  if ('match' in data) {
    env.match_0 = data.match[0];
  }
  return env;
};

const sortPath = (a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
};

module.exports = ((job, done) => {
  let data = job.data;
  const execOpt = {
    cwd: uploadDir,
  };
  execOpt.env = setEnv(data);
  console.log(`env: ${JSON.stringify(execOpt.env)}`);
  if ('rename' in data.operate) {
    const srcPath = childProcess.execSync(`echo ${data.operate.rename.src}`, execOpt).toString().trim();
    const destPath = childProcess.execSync(`echo ${data.operate.rename.dest}`, execOpt).toString().trim();
    console.log(`rename: ${srcPath} ${destPath}`);
    move(srcPath, destPath, (err) => {
      console.error(`rename: ${err}`);
      callback(err);
    });
  }
  if ('unlink' in data.operate) {
    const unlinkPath = childProcess.execSync(`echo ${data.operate.unlink}`, execOpt).toString().trim();
    remove(unlinkPath, (err) => {
      console.error(`unlink error: ${err}`);
      callback(err);
    });
    console.log(`unlink: ${unlinkPath}`);
  }
  if ('exec' in data.operate) {
    console.log(`exec: ${data.operate.exec}`);
    let execStdout = childProcess.execSync(data.operate.exec, execOpt).toString().trim();
    console.log(`stdout: ${execStdout.replace(/\n/g, '\nstdout: ')}`);
  }
  if ('create' in data.operate) {
    if ('fileList' == data.operate.create) {
      const option = {
        ignore: config.get('List').ignore
      };
      search.files(uploadDir, option, (err, list) => {
        if (err) {
          console.error(`search error: ${err}`);
          callback(err);
        } else {
          list.sort(sortPath);
          fs.writeFile(listFile, JSON.stringify(list, undefined, 4), 'utf8', (err) => {
            if (err) {
              console.error(`write error: ${err}`);
              callback(err);
            } else {
              console.log(`create: ${listFile}`);
            }
          });
        }
      });
    }
  }
  done();
});
