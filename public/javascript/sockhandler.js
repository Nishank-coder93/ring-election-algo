/**
 * @author: Nishank Bhatnagar
 * Student ID: 1001397098
 *
 */


var socket = io(); /* Main Socket communication with server variable */
var numofprocess = 0;
var prcs = []; /* Maintains an information Array of all the Processes */
var timer = 0; /* Timer to track for Single Election */
var timer1 = 0; /* timer for Multiple Election */
var timer2 = 0; /* timer for Multiple election */
var coordinator = 0; /* Variable to keep track of Coordinator */
var coordinatorAlive = false; /* Flag to check if Coordinator is alive */
var allprocessFlag = []; /* Flag to check if all processes are connected */
var DetectionFlag = true; /* If Coordinator is down detected */
var multipleElectionFlag = false; /* Flag to conduct Multiple Election */
var windows = []; /* keeps track of the Process Tabs open in browser */

/**
 * This function checks wether the coordinator is alive or dead
 * @return Boolean - returns false if offline else returns true
 */
function checkCoordinator() {
  if (prcs[coordinator - 1].status == "offline") {
    return false;
  } else {
    return true;
  }
}

/**
 * This function is called every second
 * In the function the every second process detects if the Coordinator is Alive or Dead
 * If Coordinator is Dead then the Process conducts Election
 */
function singleElectionDetection() {

  var cPrc = timer % 6;
  if (DetectionFlag) {
    if (prcs[cPrc].status == "online") {
      if (coordinator === 0) {
        coordinator = prcs[cPrc].id;
      } else {
        coordinatorAlive = checkCoordinator();
        if (!coordinatorAlive) {
          $('#info_log').append("<h3>" + prcs[cPrc].name + " detected that Coordinator is dead" + "</h3>");
          socket.emit("Detection", prcs[cPrc]);
          conductTimeElection(prcs[cPrc]);
          DetectionFlag = false;
        }
      }
    } else if (prcs[cPrc].status == "offline") {
      $('#' + prcs[cPrc].name + "-leaderStat").text("-");
    }
  }
  timer++;
}

/**
 * Function is called every second
 * Instead of single detection to show
 * Multiple detection and election being conducted Simultaneously
 * First checks if the current process is the only process that is online
 */
function multipleDetection() {
  var currentProcessOne = (timer1 % 6);
  var currentProcessTwo = ((timer2 + 1) % 6);

  if (DetectionFlag) {
    if (prcs[currentProcessOne].status == "online" && prcs[currentProcessTwo].status == "online") {
      if (coordinator === 0) {
        coordinator = Math.max(prcs[currentProcessOne].id, prcs[currentProcessTwo].id);
      } else {
        coordinatorAlive = checkCoordinator();

        if (!coordinatorAlive) {
          console.log(prcs[currentProcessOne].name + " and " + prcs[currentProcessTwo].name + " Detected k !!");
          $('#info_log').append("<h3>" + prcs[currentProcessOne].name + " detected that Coordinator is dead" + "</h3>");
          $('#info_log').append("<h3>" + prcs[currentProcessTwo].name + " detected that Coordinator is dead" + "</h3>");
          socket.emit("Detection", prcs[currentProcessOne]);
          conductTimeElection(prcs[currentProcessTwo]);
          socket.emit("Detection", prcs[currentProcessTwo]);
          conductTimeElection(prcs[currentProcessOne]);
          DetectionFlag = false;
        }
      }
    } else if (prcs[currentProcessOne].status == "offline" || prcs[currentProcessTwo].status == "offline") {
      if (prcs[currentProcessOne].status == "offline" && prcs[currentProcessTwo].status == "offline") {
        $('#' + prcs[currentProcessOne].name + "-leaderStat").text("-");
        $('#' + prcs[currentProcessTwo].name + "-leaderStat").text("-");
      } else if (prcs[currentProcessOne].status == "offline") {
        $('#' + prcs[currentProcessOne].name + "-leaderStat").text("-");
      } else {
        $('#' + prcs[currentProcessTwo].name + "-leaderStat").text("-");
      }
    }
  }

  if ((timer2 % 6) == 5) {
    timer1++;
  }
  timer2++;
}

/**
 * Sets up timing interval based on single or multiple election
 */
function startDetection(multiElecFlag) {
  if (!multiElecFlag) {
    setInterval(singleElectionDetection, 1000);
  } else {
    setInterval(multipleDetection, 1000);
  }
}

/**
 * This Socket distinguishes if the incoming info is for individual Process
 */
socket.on('process_info', function(data) {
  prcs = data.info;
  console.log(prcs);
});

// On initial connection
socket.on('connect', function() {
  console.log('Connected to socket.io server ');

});

/**
 * This is the main function which conducts Elecetion
 * Its a timer function which goes through each process every second
 * and passes on the Token and chooses the Leader / Coordinator as the Highest
 * Element from the Token Array
 * @param  Object ProcessData - Data about the process that started the Election
 */
function conductTimeElection(ProcessData) {
  var counter = 0; /* Counter to keep track of timer */
  var tokenArray = []; /* Array to keep the Token Message information */
  var currentP = ProcessData; /* Holds the current Process Data*/
  var coordinatorFlag = false; /* Coordinator Flag to pass the Coordinator message to Process*/
  var tokenIndex = 0; /* Keeps track of index of Token Array */
  var ElectionFlag = true; /* Flag is true while Election is going on */

  $("#info_log").append("<h2>" + ProcessData.name + " is Conducting the Election </h2>");

  /**
   * This is a timer event which goes through each process every second
   * and adds the token message as it goes through the process
   */
  var interval = function() {
    if (currentP.status == "online" && ElectionFlag) {
      tokenArray.push(currentP.id);
      $("#info_log").append("<h4>" + currentP.name + " is Sending data -> " + tokenArray + "</h4>");
    }

    currentP = prcs[currentP.next];
    if (counter % 6 == 5 && ElectionFlag) {
      if (prcs[coordinator - 1].status != "offline") {
        $("#" + prcs[coordinator - 1].name + "-info").css("background", "#39e600");
      }
      coordinator = Math.max.apply(null, tokenArray);
      $("#info_log").append("<h2> Process" + coordinator + " is elected as the current Leader/ Coordinator </h2>");
      coordinatorFlag = true;
      ElectionFlag = false;
    }

    if (coordinatorFlag && (tokenIndex != tokenArray.length)) {
      $("#info_log").append("<h5>" + prcs[tokenArray[tokenIndex] - 1].name + " Updated the Coordinator to -> " + coordinator + " </h5>");
      $("#" + prcs[tokenArray[tokenIndex] - 1].name + "-leaderStat").text(coordinator);
      tokenIndex++;
    } else if (tokenIndex == tokenArray.length) {
      $("#info_log").append("<hr></br>");
      $("#" + prcs[coordinator - 1].name + "-info").css("background", "#229ceb");
      coordinatorFlag = false;
      DetectionFlag = true;
      tokenIndex = 0;
      clearInterval(timeInterval);

    }
    counter++;
  };

  var timeInterval = setInterval(function() {
    interval();
  }, 1000);
}

/**
 * When a process connects
 * Wait for all the process to connect and then conducts election
 * Thereafter Everytime a process coonects it initiates Election
 */
socket.on('connected_process', function(data) {
  numofprocess++;
  var process_info = '#' + data.name + '-info';
  var process_status = '#' + data.name + '-status';
  var process_btn = '#' + data.name + '-btn';
  var prcId = data.id;
  prcs[prcId - 1].status = "online";
  console.log(prcs[prcId - 1]);

  $(process_info).css('background', '#39e600');
  $(process_status).text('Online');
  $(process_btn).text('Crash');
  $(process_btn).removeClass('btn-success').addClass('btn-danger');

  $('#main_log').append('<h2>' + data.name + ' Connected successfully !<h2> <hr></br>');
  allprocessFlag.push(prcId);

  if (allprocessFlag.length >= 6) {
    conductTimeElection(prcs[data.id - 1]);
  }

});

/**
 * If a Proess Disconnects.
 * Turns the Process Offline
 * And the auto detect feature selects new coordinator
 */
socket.on('disconnected_process', function(data) {
  numofprocess--;
  prcs[data.id - 1].status = 'offline';
  var stat = "";

  var process_info = '#' + data.name + '-info';
  var process_status = '#' + data.name + '-status';
  var process_btn = '#' + data.name + '-btn';

  $(process_info).css('background', '#ff471a');
  $(process_status).text('Offline');
  $(process_btn).text('Restart');
  $(process_btn).removeClass('btn-danger').addClass('btn-success');

  $('#main_log').append('<h2>' + data.name + ' Disconnected !<h2>');

  if (multipleElectionFlag) {
    if (numofprocess == 1) {
      for (var j = 0; j < prcs.length; j++) {
        if (prcs[j].status == "online" && prcs[j].id !== coordinator) {
          console.log(prcs[j]);
          $('#info_log').append("<h3>" + prcs[j].name + " detected that Coordinator is dead" + "</h3>");
          DetectionFlag = false;
          socket.emit("Detection", prcs[j]);
          conductTimeElection(prcs[j]);
        }
      }
    }
  }

});

/**
 * for detecting the Connection is from the Indivdual Process
 */
socket.on('Process_Info', function(data) {
  $('body').html("<h1>" + data.name + ' is running at http://localhost:300' + data.id + "</h5>");
});

/**
 * Executes if Single detection is selected
 */
$('#execute').click(function(event) {
  event.preventDefault();
  windows['1'] = window.open('http://localhost:3001/');
  windows['2'] = window.open('http://localhost:3002/');
  windows['3'] = window.open('http://localhost:3003/');
  windows['4'] = window.open('http://localhost:3004/');
  windows['5'] = window.open('http://localhost:3005/');
  windows['6'] = window.open('http://localhost:3006/');

  $("#execute").hide();
  $("#execute_multi").hide();
  $("#processContainer").slideDown(3000);

  startDetection(multipleElectionFlag);
});

/**
 * Executes if Multiple Detection is selected
 */
$('#execute_multi').click(function(event) {
  windows['1'] = window.open('http://localhost:3001/');
  windows['2'] = window.open('http://localhost:3002/');
  windows['3'] = window.open('http://localhost:3003/');
  windows['4'] = window.open('http://localhost:3004/');
  windows['5'] = window.open('http://localhost:3005/');
  windows['6'] = window.open('http://localhost:3006/');

  $("#execute").hide();
  $("#execute_multi").hide();
  $("#processContainer").slideDown(3000);
  multipleElectionFlag = true;
  startDetection(multipleElectionFlag);

});
