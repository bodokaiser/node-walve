var cluster = require('cluster');

if (cluster.isMaster) {
  require('./master');
}

if (cluster.isWorker) {
  require('./worker');
}
