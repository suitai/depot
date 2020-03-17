const bull = require('bull');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const fileQueue = new bull('depot-file-queue', `redis://${redisHost}:${redisPort}`);

const fileQueueAdd = ((data) => {
  fileQueue.add(data);
});

fileQueue.process('/opt/app-root/src/depot/lib/processor.js');

module.exports = {file: {push: fileQueueAdd}};
