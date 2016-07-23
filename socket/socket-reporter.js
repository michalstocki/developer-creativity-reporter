'use strict';

const ReportGenerator = require('../main/report-generator');
const driller = require('./../main/bitbucket-pullrequest-driller');

module.exports = function(server) {

	const io = require('socket.io')(server);

	io.on('connection', function(socket) {
		socket.on('get-report', function(data) {
			const reportGenerator = new ReportGenerator(data.username, data.repositories);
			reportGenerator.on('report-progress', (progress) => {
				socket.emit('drilling-bitbucket-progress', {progress: progress});
			});
			reportGenerator.generateCSV().then(() => {
				console.log('Report generated!');
			});
		});
	});

};