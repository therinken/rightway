'use-strict';
const

    fs = require('fs'),
    net = require('net'),

    filename = process.argv[2],
    server = net.createServer(function(connection) {
        //reporting
        console.log('Subscriber connected.');
        connection.write("Now watching '" + filename + "' for changes...\n");

        //watcher setup
        var watcher = fs.watch(filename, function() {
            connection.write("File '" + filename + "' changed: " + new Date() + "\n");
        });

        //cleanup
        connection.on('close', function() {
            console.log('Subscriber disconnected.');
            watcher.close();
        });
    });

if (!filename) {
    throw Error('No target filename was specified');
}

server.listen(8124, function() {
    console.log('Listening for subcribers...');
});

//open up 3 terminal windows pointing to this dir...
//window 1: node --harmony net-watcher.js target.txt
//window 2: telnet localhost 8124
//window 3: touch target.txt
//
//Shazam! Socket-to-ya!
