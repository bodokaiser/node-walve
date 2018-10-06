const os      = require('os')
const cluster = require('cluster')

const max = os.cpus().length

for (let i = 0; i < max; i++) {
  cluster.fork()
}

cluster.on('fork', worker => console.log(`worker #${worker.id} forked.`))
cluster.on('exit', worker => console.log(`worker #${worker.id} exited.`))
