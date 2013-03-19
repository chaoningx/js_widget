var http = require('http'),
	url = require('url'),
	path = require('path'),
	xcn = require('xcn'),
	mongo = require('mongodb'),
	fs = require('fs');

var _rootPath = xcn.Config._rootPath = path.resolve('Content');

var util = xcn.Utils;
var app = xcn.App;
var Cache = xcn.ICache;
var Result = xcn.Result;

app.get("/uploadfile/", function(req, res) {
	res.render("upload.html");
});

app.post("/upload/", function(req, res, query) {
	var buffers = [],
			len = 0;
	req.on('data', function(buf) {
		len += buf.length;
		buffers.push(buf);
	});
	req.on('end', function() {
		var buffer = new Buffer(len),
			pos = 0;
		buffers.forEach(function(n, i) {
			buffers[i].copy(buffer, pos);
			pos += buffers[i].length;
		});
		var q = url.parse('?' + buffer.toString(), true, true).query;
		var fileName = q.name ? q.name : new Date().getTime();
		fs.exists('/Users/chaoningxie/Documents/uploadFiles/' + fileName, function(exists) {
			if (exists) {
				var s = fileName.split('.');
				fileName = s[0] + "_" + new Date().getTime() + "." + s[1];
			}
			var base64Data = q.fileData.split(',')[1];
			var dataBuffer = new Buffer(base64Data, 'base64'); 
			fs.writeFile('/Users/chaoningxie/Documents/uploadFiles/' + fileName, dataBuffer, function(err) {
				if(err) {
					res.send(Result.FAILED(err));
				}else {
					res.send(Result.SUCCESS("ok"));
				}
			});
		});
	});
});
/* logic */

var Server = mongo.Server,
	Db = mongo.Db;

var _server = new Server('127.0.0.1', 27017, { auto_reconnect: true });
var _db = new Db('newsclues', _server);

_db.open(function(err, db) {
	if(!err) {
		console.log('db is connected.');
		xcn.Config._mongodb = db;
		http.createServer(function (req, res) {
			var paths = url.parse(req.url),
				query = {};
			
			if(paths.pathname === '/favicon.ico') { return; }
			res.setHeader('server', 'xcn');
			if(paths.pathname.indexOf('.') != -1) {
				util.readFile(path.join(_rootPath, paths.pathname), function(buf) {
					var ext = path.extname(paths.pathname).substring(1);
					if(ext === 'js') {
						res.writeHead(200, { 'Content-Type': "application/javascript" });
					}else if(ext === 'css') {
						res.writeHead(200, { 'Content-Type': "text/css" });
					}
					res.end(buf);
				});
			}else {
				if(paths['query']) {
					paths.query.split('&').forEach(function(item, index) {
						var temp = item.split('=');
						if(temp.length != 0) { query[temp[0]] = temp[1]; }
					});
				}
				if(paths.pathname.charAt(paths.pathname.length - 1) != '/') { paths.pathname += '/'; }
				var method = app.getMethod(req.method, paths.pathname);
				if(method) {
					method(req, res, query);
				}else {
					res.redirect('/404/');
				}
			}
		}).listen(80);

		console.log("start");
	}
});