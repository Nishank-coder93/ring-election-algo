var socket = io();
var processes = [];

// On initial connection 
socket.on('connect', function (){
	 console.log('Connected to socket.io server ');

});

socket.on('test', function (data){
	console.log(data);
});

socket.on('connected_process', function (data){
	processes.push(data.id);
	console.log(processes);
	$('#main_log').append("<button class='btn-primary'> process" + data.id + '</button> is connected ' + '</br>');
});

socket.on('process_test', function (){
	$('body').html(" This a process running on LocalHost ");
});
