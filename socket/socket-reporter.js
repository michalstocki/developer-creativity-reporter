'use strict';

const ForutnaReportGenerator = require('../main/fortuna-report-generator');

module.exports = function(server) {

	const io = require('socket.io')(server);

	io.on('connection', function(socket) {
		socket.on('get-report', function(data) {
			const reportGenerator = new ForutnaReportGenerator(data);
			reportGenerator.on('progress', (progress) => socket.emit('progress', progress));
			reportGenerator.on('warning', (warning) => socket.emit('warning', warning));
			const reportFilename = `fortuna-report-${data.username}-${Date.now()}.csv`;
			reportGenerator.generateCSVReportFile().then((fileBuffer) => {
				socket.emit('report-file', {buffer: fileBuffer, filename: reportFilename});
			}).catch((error) => {
				console.log('Report not generated', error);
				socket.emit('fail', {info: error});
			});
		});
	});

};