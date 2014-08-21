#!/usr/bin/env node

var server = require('http').createServer(httpHandler),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    io = require('socket.io').listen(server),
    querystring = require('querystring'),
    url = require('url'),
    send = require('send'),
    server,
    socket;

server.listen(8090);
var assetsLocation = process.argv[2];

function httpHandler(req, res) {
    switch(req.method){
        case 'GET':
            console.log("get");
            path = url.parse(req.url).pathname;
            console.log(path);
            // nodejs automatically provide the current assetsLocation path
            if (path === null || path === '/') {
                res.write(assetsLocation);
                res.end();
                return;
            }
            send(req, path, {root: assetsLocation})
                .pipe(res);
            return;
        case 'POST':
            var postData = '';
            req.on('data', function(chunck) {
                postData += chunck.toString();
            });
            req.on('end', function () {
                postData = querystring.parse(postData);
                console.log("post req");

                if(postData.action === 'cssReload'){
                    console.log(postData.name);
                    io.emit('cssReload', postData.name);
                }

                if(postData.action === 'reload'){
                    console.log(postData.name);
                    io.emit('reload', 'reload');
                }
            });

            res.write('ok');
            res.end();
            return;

        case 'PUT':
            spawn('open', ['http://localhost:8090/index.html']);
            res.write('ok');
            res.end();
            return;

        case 'DELETE':
            process.exit(1);
            return;
    }
}

io.on('connection', function(socket) {
    console.log("user connected");
});

