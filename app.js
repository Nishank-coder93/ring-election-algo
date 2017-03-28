
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var ipchandler = require('./ipchandler/ipchandler.js');

server.listen(3000);

var ClassSetup = function (app, socket){
	this.app = app;
	this.socket = socket;
};

ClassSetup.prototype.config = function (){
		this.app.use(express.static(__dirname + '/public'));

		this.app.get('/', function (req, res) {
			res.sendFile(__dirname + '/public/index.html');
		});
};

ClassSetup.prototype.sockConn = function (){
	 	this.socket.on('connection', function (sock){
	 		console.log('Server running at http://localhost:3000');
	 	});

	 	new ipchandler(this.app, this.socket).connect();
}

ClassSetup.prototype.execute = function (){
	this.config();
	this.sockConn();
};

var Setup = new ClassSetup(app, io);
Setup.execute();