const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');
const queue = require('async/queue');

const uploadDir = process.env.UPLOAD_DIR;

const filemove = (oldpath, newpath, done) => {
  const newdir = path.dirname(newpath);
  if (!fs.existsSync(newdir)) {
    fs.mkdirsSync(newdir);
  }
  fs.rename(oldpath, newpath, (err) => {
    if (err) return done(err);
  });
};

const file = queue((data, callback) => {
  const execOpt = {
    cwd: uploadDir,
    env: {
      filepath: path.relative(uploadDir, data.filepath),
      dirname: path.relative(uploadDir, path.dirname(data.filepath)),
    }
  };
  if ('dest' in data) {
    execOpt.env.dest = data.dest;
  }
  if ('filename' in data) {
    execOpt.env.filename = data.filename;
  }
  if ('match' in data) {
    execOpt.env.match_0 = data.match[0];
  }
  console.log(`env: ${JSON.stringify(execOpt.env)}`);
  if ('rename' in data.operate) {
    let renamePath = childProcess.execSync(`echo ${data.operate.rename}`, execOpt).toString().trim();
    renamePath = path.join(uploadDir, renamePath);
    console.log(`rename: ${renamePath}`);
    filemove(data.filepath, renamePath, (err) => {
      console.error(`rename: ${err}`);
      callback(err);
    });
    execOpt.env.filepath = path.relative(uploadDir, renamePath);
    execOpt.env.dirname = path.relative(uploadDir, path.dirname(renamePath));
  }
  if ('post' in data.operate) {
    console.log(`post: ${data.operate.post}`);
    let postStdout = childProcess.execSync(data.operate.post, execOpt).toString().trim();
    postStdout = postStdout.replace(/\n/g, '\nstdout: ');
    console.log(`stdout: ${postStdout}`);
  }
  callback(null);
});

module.exports = {file: file};
