var express = require('express'); /* Imports Express app */
var app = express(); /* Inities the Express framework */
var server = require('http').Server(app); /* Initiates the HTTP Server */
var io = require('socket.io')(server); /* Initiates Socket communication */
var mainsocket;

var Ipchandler = require('./ipchandler/ipchandler.js'); /* Class ipchandler */

server.listen(3000); /* Listens on PORT 3000 */

/**
 * Main Class Consturctor
 * Configures and Initiates the variables
 * @param  Express app     - Express framework
 * @param  Socket socket - Main Socket communication
 */
var ClassSetup = function(app, socket) {
  this.app = app;
  this.socket = socket;
  this.processHolder = [];
};

/**
 * This configures the process at the start
 * of Server
 * @return Array processHolder - Returns the Array of Process Information
 */
ClassSetup.prototype.processSetup = function() {

  for (var i = 0; i < 6; i++) {
    var pstr = 'process' + (i + 1);
    var before;
    var after;

    if (i === 0) {
      before = 5;
      after = 1;
    } else if (i == 5) {
      before = 4;
      after = 0;
    } else {
      before = i - 1;
      after = i + 1;
    }

    var obj = {
      name: pstr,
      id: (i + 1),
      status: 'offline',
      prev: before,
      next: after
    };

    this.processHolder.push(obj);
  }
  return this.processHolder;
};

/**
 * Initiates the application
 * and sends the Public file ie. .html, .js, .css etc.
 */
ClassSetup.prototype.config = function() {
  this.app.use(express.static(__dirname + '/public'));

  this.app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });
};

/**
 * Handles the Socket Connection and Connection of other processes
 * with Main Socket
 */
ClassSetup.prototype.sockConn = function() {
  var prcInfo = this.processSetup();
  var ipcHandle = new Ipchandler(this.app, this.socket, prcInfo);

  this.socket.on('connection', function(sock) {
    console.log('Server running at http://localhost:3000');
    /**
     * On initial connection to server
     * Sends the information of Processes to Front end
     */
    sock.emit('process_info', {
      info: prcInfo
    });

    sock.on("Detection", function(data) {
      ipcHandle.detection(data);
    });

  });

  ipcHandle.connect();
};

/**
 * Executes the application
 * This is the Starting point
 */
ClassSetup.prototype.execute = function() {
  this.config();
  this.sockConn();
};

/**
 * Creates new object of the class and executes the Application
 */
var Setup = new ClassSetup(app, io);
Setup.execute();
