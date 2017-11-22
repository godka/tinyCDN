var os = require('os');
var request = require('request');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var log4js = require('log4js');
log4js.configure({
    appenders: [{
        type: 'file',
        filename: 'default.log'
    }]
})
var logger = log4js.getLogger('tracker');
var weight = 0;
var port = 3000;
var HashMap = require('hashmap');
var map = new HashMap();

//for websocket
io.on('connection', (socket) => {
    console.log('on connection' + socket);
    socket.on('login', (data) => {
        console.log(socket.handshake.address);
        var address = socket.handshake.address.replace('::ffff:', '');
        if (!map.has(address)) {
            var _array = new Array();
            map.set(address, _array);
        }
    });

    socket.on('close', (msg) => {
        var address = socket.handshake.address.replace('::ffff:', '');
        if (map.has(address)) {
            map.remove(address);
        }
    });

    socket.on('status', function (msg) {
        var address = socket.handshake.address.replace('::ffff:', '');
        if (!map.has(address)) {
            var _array = new Array();
            map.set(address, _array);
        } else {
            var _array = map.get(address);
            _array.push(msg);
            if (_array.length >= 10) {
                _array.shift();
            }
        }
    });
});

function getfiles(filePath) {
    return fs.readdirSync(filePath);
}

server.listen(3001, () => {
    port = server.address().port;
    console.log("listening at : %s", port);
});

function getClientIp(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip.replace('::ffff:', '');
};

function getExtensions(file) {
    var ptr = file.split('.');
    if (ptr.length > 0) {
        return ptr[ptr.length - 1];
    } else {
        return '';
    }
}

app.get('/getm3u8', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    var ret = [];
    var arr = getfiles('./resource');
    arr.forEach((t) => {
        if (getExtensions(t) == 'm3u8') {
            ret.push(t);
        }
    });
    res.send(ret);
});

app.get('/*.m3u8', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    logger.debug('request', req.path + ' from ' + getClientIp(req));
    res.sendfile('./resource' + req.path);
});

function guessFilenameFromUri(uri) {
    var arr = uri.split('/');
    if (arr.length > 0) {
        return arr[arr.length - 1];
    } else {
        return 'undefined';
    }
}

app.get('/geturi', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    _out_arr = []
    map.forEach((v, k) => {
        _out_arr.push({ server_name: k, state: v });
    })
    res.send(JSON.stringify(_out_arr));
});