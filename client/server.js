var express = require('express');
var app = require('express')();
var server = require('http').Server(app);

server.listen(8080, () => {
    port = server.address().port;
    console.log("listening at : %s", port);
    //generate();
});

app.use(express.static('html'));