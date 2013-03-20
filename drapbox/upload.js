var http = require('http'),
	url = require('url'),
	path = require('path'),
	xcn = require('xcn'),
	mongo = require('mongodb'),
	fs = require('fs'),
	io = require('socket.io');

var _rootPath = xcn.Config._rootPath = path.resolve('Content');

var util = xcn.Utils;
var app = xcn.App;
var Result = xcn.Result;
var socket = null;

app.get("/uploadfile/", function(req, res) {
	res.render("upload.html");
});
/* logic */

var Server = mongo.Server,
	Db = mongo.Db;

var _server = new Server('127.0.0.1', 27017, { auto_reconnect: true });
var _db = new Db('newsclues', _server);

_db.open(function(err, db) {
	if(!err) {
		console.log('db is connected.');
		sasa.Config._mongodb = db;
		var httpServer = http.createServer(function (req, res) {
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
				if(paths.pathname.charAt(paths.pathname.length - 1) != '/') { 
					paths.pathname += '/'; 
				}
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

	socket = io.listen(httpServer);
	socket.sockets.on('connection', function (client) {
		var dir = '/Users/chaoningxie/Documents/uploadFiles/';
		var currentFile = null;
		client.on('fileData', function (data) {
			var fileName = data.name,
				status = data.status,
				dataBuffer = new Buffer(data.fileData, 'binary'),
				tempName = client.id;

			if (currentFile == null) {
				currentFile = fileName;
			};

			if (currentFile == fileName) {
				fs.appendFileSync(dir + tempName, dataBuffer);
				if (status == "done") {
					var exists = fs.existsSync(dir + fileName);
					if (exists) {
						fileName = tempName + "_" + new Date().getTime() + "_" + fileName;
					}
					fs.renameSync(dir + tempName, dir + fileName);
					currentFile = null;
				}
				client.emit('result', Result.SUCCESS('ok'));
			}else {
				var exists = fs.existsSync(dir + tempName);
				if (exists) {
					fs.unlinkSync(dir + tempName);
				}
				client.emit('result', Result.FAILED('error submit.'));
			}
		});
	});
});
