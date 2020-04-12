const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

const config = require('config');
const search = require('../lib/search.js');

const uploadDir = process.env.UPLOAD_DIR;

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
  if ('basedir' in data) {
    env.basedir = data.basedir;
  }
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

module.exports = ((job, done) => {
  let data = job.data;
  let execOpt = {
    cwd: uploadDir,
  };
  execOpt.env = setEnv(data);
  console.log(`env: ${JSON.stringify(execOpt)}`);
  if ('rename' in data.operate) {
    let srcPath = childProcess.execSync(`echo ${data.operate.rename.src}`, execOpt).toString().trim();
    let destPath = childProcess.execSync(`echo ${data.operate.rename.dest}`, execOpt).toString().trim();
    srcPath = path.join(uploadDir, srcPath);
    destPath = path.join(uploadDir, destPath);

    console.log(`rename: ${srcPath} ${destPath}`);
    move(srcPath, destPath, (err) => {
      console.error(`rename: ${err}`);
      callback(err);
    });
  }
  if ('unlink' in data.operate) {
    let unlinkPath = childProcess.execSync(`echo ${data.operate.unlink}`, execOpt).toString().trim();
    unlinkPath = path.join(uploadDir, unlinkPath);

    console.log(`unlink: ${unlinkPath}`);
    remove(unlinkPath, (err) => {
      console.error(`unlink error: ${err}`);
      callback(err);
    });
  }
  if ('exec' in data.operate) {
    console.log(`exec: ${data.operate.exec}`);
    let execStdout = childProcess.execSync(data.operate.exec, execOpt).toString().trim();
    console.log(`stdout: ${execStdout.replace(/\n/g, '\nstdout: ')}`);
  }
  if ('create' in data.operate) {
    if ('fileList' in data.operate.create) {
      let srcPath = childProcess.execSync(`echo ${data.operate.create.fileList.src}`, execOpt).toString().trim();
      let destPath = childProcess.execSync(`echo ${data.operate.create.fileList.dest}`, execOpt).toString().trim();
      srcPath = path.join(uploadDir, srcPath);
      destPath = path.join(uploadDir, destPath);
      const option = {
        ignore: config.get('List').ignore
      };

      console.log(`fileList: ${srcPath} ${destPath}`);
      search.catalog(srcPath, destPath, option, (err) => {
        if (err) {
          console.error(`create error: ${err}`);
          callback(err);
        } else {
          console.log(`create: ${destPath}`);
        }
      });
    }
  }
  done();
});
