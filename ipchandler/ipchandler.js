/**
 * @author: Nishank Bhatnagar
 * Student ID: 1001397098
 * This section handles the Sockets Processor
 */

var sockPrcInfo = []; /* Array of all the process information */
var coordinator = 0; /* Keep track of Coordinator */
var allProcessFlag = []; /* keeps track of all the processes that are connected */

/**
 * This function conducts the election in Ring Election Algorithm and
 * selects the new Coordinator if it's the highest process
 * @param  Socket mainSocket   - This the main socket
 * @param  Array ProcessArray  - This has all the information of processes
 * @param  Integer id          - The id of the process that is conducting election
 */
var conductElection = function(mainSocket, ProcessArray, id) {
  var currentProcess = ProcessArray[id - 1];

  console.log("Process " + id + " is conducting the election !");
  var elecArr = [];
  var ind = 0;
  var prcLen = ProcessArray.length;

  while (ind <= prcLen) {
    if (currentProcess.status == 'online') {
      elecArr.push(currentProcess.id);
      currentProcess = ProcessArray[currentProcess.next];
      ind++;
    } else {
      currentProcess = ProcessArray[currentProcess.next];
      ind++;
    }
  }

  coordinator = Math.max.apply(null, elecArr);

  for (var i = 0; i < elecArr.length - 1; i++) {
    var msg = " ";
    for (var j = 0; j < i + 1; j++) {
      msg = msg + elecArr[j] + ' ';
    }
    console.log("Process" + elecArr[i] + " is sending message -> " + msg + "");
  }

  console.log(coordinator + " is elected as the current Leader / Coordinator");

  for (i = 0; i < elecArr.length - 1; i++) {
    console.log(ProcessArray[elecArr[i] - 1].name + " updated the Coordinator to -> " + coordinator);
  }

};

/**
 * Constructor of the class Handle
 * Configures the initial variables and Ports
 * @param  Express app         - Main express function
 * @param  Socket socket       - The main Socket
 * @param  Array processInfo   - Array of Process information
 */
var handle = function(app, socket, processInfo) {
  this.app = app;
  this.mainsocket = socket;
  this.processInfo = processInfo;
  sockPrcInfo = processInfo;

  this.port1 = 3001;
  this.port2 = 3002;
  this.port3 = 3003;
  this.port4 = 3004;
  this.port5 = 3005;
  this.port6 = 3006;

};

/**
 * Handles the connection of Each Socket appropriately
 * and conducts election on Socket Connection
 * @param  Socket sockSwitches  - individual socket
 * @param  Integer id           - id of the Socket that connected
 */
handle.prototype.sockHandler = function(sockSwitches, id) {
  var io = this.mainsocket;

  sockSwitches.on('connection', function(sock) {
    /**
     * Update the status of the process to Online
     * Send the information to individual process
     */
    sockPrcInfo[id - 1].status = 'online';
    sockSwitches.emit('Process_Info', sockPrcInfo[id - 1]);

    /**
     * Checks if the connection is for the first time connects at certain time
     * If not first time connection then connects in 3 second time interval
     */

    setTimeout(function() {
      allProcessFlag.push(id);
      io.emit('connected_process', sockPrcInfo[id - 1]);
      console.log(sockPrcInfo[id - 1].name + ' is connected');
      if (allProcessFlag.length >= 6) {
        conductElection(io, sockPrcInfo, id);
      }
      // conductElection(io, sockPrcInfo, id);
    }, (id * 1000));


    /**
     * Handles Disconnect of a process
     */
    sock.on('disconnect', function() {
      sockPrcInfo[id - 1].status = "offline";
      console.log(sockPrcInfo[id - 1].name + " is closed");
      io.emit('disconnected_process', sockPrcInfo[id - 1]);
    });

  });
};

/**
 * Detects that Coordinator is dead and conducts Election
 * @param  Object data - The Process which detected that coordinator is dead
 */
handle.prototype.detection = function(data) {
  console.log(data.name + " detected that coordinator is Dead !");
  conductElection(this.mainsocket, sockPrcInfo, data.id);
};

/**
 * Handles the connection of processes with the server
 */
handle.prototype.connect = function() {

  var io = this.mainsocket;

  this.process1 = require('http').Server(this.app).listen(this.port1);
  this.sockHandler(require('socket.io').listen(this.process1), 1);

  this.process2 = require('http').Server(this.app).listen(this.port2);
  this.socket2 = require('socket.io').listen(this.process2);
  this.sockHandler(this.socket2, 2);

  this.process3 = require('http').Server(this.app).listen(this.port3);
  this.socket3 = require('socket.io').listen(this.process3);
  this.sockHandler(this.socket3, 3);

  this.process4 = require('http').Server(this.app).listen(this.port4);
  this.socket4 = require('socket.io').listen(this.process4);
  this.sockHandler(this.socket4, 4);

  this.process5 = require('http').Server(this.app).listen(this.port5);
  this.socket5 = require('socket.io').listen(this.process5);
  this.sockHandler(this.socket5, 5);

  this.process6 = require('http').Server(this.app).listen(this.port6);
  this.socket6 = require('socket.io').listen(this.process6);
  this.sockHandler(this.socket6, 6);

};

module.exports = handle;
