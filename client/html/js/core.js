﻿var player = null;
function guessFilenameFromUri(uri) {
    var arr = uri.split('/');
    if (arr.length > 0) {
        return arr[arr.length - 1];
    } else {
        return 'undefined';
    }
}

function downloadm3u8(filename) {
    $.ajaxSetup({
        async: false
    });
    console.log(filename);
    if (player == null) {
        $('#videonow').append("<video id=\"example-video\" width=\"800\" height=\"480\" class=\"video-js vjs-default-skin\" controls></video>");
        player = videojs("example-video", {
            html5: {
                hls: {
                    //not use allow access
                    withCredentials: false
                }
            }
        });
    } else {
        player.pause();
    }
    player.src({
        src: 'http://localhost:3001/' + filename,
        type: 'application/x-mpegURL',
    });

    player.tech({ IWillNotUseThisInPlugins: true }).hls.xhr.beforeRequest = function (options) {
        $.get('http://localhost:3001/geturi',function (data) {
            servername = '127.0.0.1'
            _server = JSON.parse(data);
            if(_server.length > 0){
                _servername = _server[0].server_name;
            }
            var _real_url = guessFilenameFromUri(options.uri);
            var _uri = 'http://' + _servername + ':30000/' + _real_url;
            console.log(options.uri + '->' + _uri);
            options.uri = _uri;
            return options;
        });
    };

    player.play();
}
$.get('http://localhost:3001/getm3u8', function (data) {
    data.forEach(function (element) {
        var str = "<a onclick=\"downloadm3u8('" + element + "')\" class=\"list-group-item\">" + element + "</a>";
        //var str = "<button type=\"button\" onclick = \"downloadm3u8('" + element + "')\" class=\"btn btn-default btn-lg \">" + element + "</button>";
        $('#buttonnow').append(str);
    }, this);
});

window.addEventListener('load', function () {
    console = new Console('console', console);
});