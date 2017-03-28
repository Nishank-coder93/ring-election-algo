var express = require('express');
var router = express.Router();
var path = require('path');
var moment = require('moment'); // For timestamp 

var returnRouter = function (io){

	/* GET home page. */
	router.get('/', function (req, res) {
		// On initial request server sends the Chat page which is represented in the chat HTML (Frontend)
	  res.sendFile(path.join(__dirname, '../public', 'index.html'));

	});


	io.on('connection', function (socket){
		console.log('User connected !');

		 });

	return router;

}

module.exports = returnRouter;