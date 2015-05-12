'use strict';
const
    cluster = require('cluster'),
    zmq = require('zmq');

if (cluster.isMaster) {
    // create PUSHER and PULLER sockets and bind the endpoints
    let
        pusher = zmq.socket('pusher').bind('ipc://filer-pusher.ipc'),
        puller = zmq.socket('puller').bind('ipc://filer-puller.ipc'),

        // initialize a counter
        countReady = 0,

        // send out thirty jobs
        workPusher = function() {
            for (let i = 0; i < 30; i++) {
                pusher.send(JSON.stringify({
                    index: i
                }));
            }
        };


    // listen for worker messages
    puller.on('message', function(data) {
        let message = JSON.parse(data);

        if (message.ready) {
            countReady += 1;
            if (countReady === 3) {
                workPusher();
            }
        } else if (message.result) {
            console.log('received: ' + data);
        }
    });

    // fork three worker processes
    for (let i = 0; i < 3; i++) {
        cluster.fork();
    }

    // listen for workers to come online
    cluster.on('online', function(worker) {
        console.log('Worker' + worker.process.pid + ' is online.');
    });
} else {
    // create a pull socket and connect to the master push
    // create a push socket and connect to the master pull
    let puller = zmq.socket('pull').connect("ipc://filer-pusher.ipc"),
        pusher = zmq.socket('push').connect("ipc://filer-puller.ipc");

    puller.on('message', function(data) {
        // parse the incoming messages
        let job = JSON.parse(data);
        console.log('process.pid' + " received job: " + job.index);

        pusher.send(JSON.stringify({
            // publish the responses
            index: job.index,
            pid: process.pid,
            result: 'succcess'
        }));
    });

    pusher.send(JSON.stringify({
        // signal ready...
        ready: true,
        pid: process.pid
    }));
}
