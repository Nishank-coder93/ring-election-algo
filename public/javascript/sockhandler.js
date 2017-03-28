var socket = io();
var processes = [];

// On initial connection 
socket.on('connect', function (){
	 console.log('Connected to socket.io server ');

});


socket.on('connected_process', function (data){

	processes.push(data.id);

	var process_info = "#" + data.name + "-info";
	var process_status = "#" + data.name + "-status";
	var process_btn = "#" + data.name + "-btn";

	$(process_info).css('background', '#39e600');
	$(process_status).text('Online');
	$(process_btn).text('Crash');
	$(process_btn).removeClass('btn-success').addClass('btn-danger');

	$('#main_log').append("<h5>" + data.name + " Connected successfully !<h5>");
});

socket.on('disconnected_process', function (data){
	processes.push(data.id);

	var process_info = "#" + data.name + "-info";
	var process_status = "#" + data.name + "-status";
	var process_btn = "#" + data.name + "-btn";

	$(process_info).css('background', '#ff471a');
	$(process_status).text('Offline');
	$(process_btn).text('Restart');
	$(process_btn).removeClass('btn-danger').addClass('btn-success');

	$('#main_log').append("<h5>" + data.name + " Disconnected !<h5>");
});

socket.on('process_test', function (){
	$('body').html(" This a process running on LocalHost ");
});


