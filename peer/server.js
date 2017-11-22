var os = require('os');
var request = require('request');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var fs = require('fs');
var log4js = require('log4js');
var io = require('socket.io-client');
log4js.configure({
    appenders: [{
        type: 'file',
        filename: 'default.log'
    }]
})
var logger = log4js.getLogger('peer');
var tracker_host = '127.0.0.1:3001';
var interval = 1000 * 30; // one second = 1000 x 1 ms
var req_count = 0
var send_bytes = 0
var send_totaltime = 0

var client = io.connect('ws://' + tracker_host);
client.on('connect', function (data) {
    console.log('ws connected!');
    client.emit('login', {
        msg: 'hi'
    });
    setInterval(() => {
        generate(client);
    }, interval);
});

function getTime() {
    return new Date().toLocaleString();
}
server.listen(30000, () => {
    port = server.address().port;
    console.log("listening at : %s", port);
});

function generate(client) {
    client.emit('status', {
        time: getTime(),
        count: req_count,
        bytes: send_bytes,
        total: send_totaltime
    });
    req_count = 0; send_bytes = 0; send_totaltime = 0;
}

function getClientIp(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip.replace('::ffff:', '');
};

app.get('/*.ts', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    logger.debug('request', req.path + ' from ' + getClientIp(req));
    req_count++;
    start = Date.now()
    res.sendFile(__dirname + '/resource' + req.path);
    res.on('finish', () => {
        var duration = Date.now() - start;
        states = fs.statSync(__dirname + '/resource' + req.path);
        send_bytes += states.size;
        send_totaltime += duration;
        console.log('Download time:' + req.path + ',' + duration + 'ms');
    });
});