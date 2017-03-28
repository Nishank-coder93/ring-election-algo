var handle = function (app, socket){
	this.app = app;
	this.mainsocket = socket;

	this.port1 = 3001;
	this.port2 = 3002;
	this.port3 = 3003;
	this.port4 = 3004;
	this.port5 = 3005;
	this.port6 = 3006;
};

handle.prototype.connect = function (app, socket){

	var io = this.mainsocket;

this.process1 = require('http').Server(this.app).listen(this.port1);
this.socket1 = require('socket.io').listen(this.process1);
this.socket1.on('connection', function (sock){
	console.log('Process 1 is connected');
	sock.emit('process_test')
	io.emit('connected_process', { name: 'process1', id: 1});
	sock.on('disconnect', function (){
		console.log("process 1 disconnected");
	});

});

this.process2 = require('http').Server(this.app).listen(this.port2);
this.socket2 = require('socket.io').listen(this.process2);
this.socket2.on('connection', function (sock){
	sock.emit('process_test')
	io.emit('connected_process', { name: 'process2', id: 2});
	console.log('Process 2 is connected');
});

this.process3 = require('http').Server(this.app).listen(this.port3);
this.socket3 = require('socket.io').listen(this.process3);
this.socket3.on('connection', function (sock){
	sock.emit('process_test')
	io.emit('connected_process', { name: 'process3', id: 3});
	console.log('Process 3 is connected');
});

this.process4 = require('http').Server(this.app).listen(this.port4)
this.socket4 = require('socket.io').listen(this.process4);
this.socket4.on('connection', function (sock){
	sock.emit('process_test')
	console.log('Process 4 is connected');
	io.emit('connected_process', { name: 'process4', id: 4});
});

this.process5 = require('http').Server(this.app).listen(this.port5)
this.socket5 = require('socket.io').listen(this.process5);
this.socket5.on('connection', function (sock){
	sock.emit('process_test')
	console.log('Process 5 is connected');
	io.emit('connected_process', { name: 'process5', id: 5});
});

this.process6 = require('http').Server(this.app).listen(this.port6)
this.socket6 = require('socket.io').listen(this.process6);
this.socket6.on('connection', function (sock){
	sock.emit('process_test')
	console.log('Process 6 is connected');
	io.emit('connected_process', { name: 'process6', id: 6});
});

}

module.exports = handle;