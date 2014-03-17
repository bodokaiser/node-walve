var os      = require('os');
var cluster = require('cluster');

var max = os.cpus().length;

for (var i = 0; i < max; i++) {
  cluster.fork();
}

cluster.on('fork', function(worker) {
  console.log('worker #' + worker.id + ' forked.');
});

cluster.on('exit', function(worker) {
  console.log('worker #' + worker.id + ' exited.');
});
