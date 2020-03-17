const queue = require('async/queue');

const bull = require('bull');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const fileQueue = new bull('depot-file-queue', `redis://${redisHost}:${redisPort}`);

const file = queue((data, callback) => {
  fileQueue.add(data);
  callback(null);
});

fileQueue.process('/opt/app-root/src/depot/lib/processor.js');

module.exports = {file: file};
