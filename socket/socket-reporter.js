'use strict';

const PullRequestListProvider = require('../main/pull-request-list-provider');
const generator = require('../main/report/report-generator');
const writer = require('../main/write-file');

module.exports = function(server) {

	const io = require('socket.io')(server);

	io.on('connection', function(socket) {
		socket.on('get-report', function(data) {
			const pullRequestListProvider = new PullRequestListProvider(data);
			pullRequestListProvider.on('report-progress', (progress) => {
				socket.emit('drilling-bitbucket-progress', {progress: progress});
			});
			pullRequestListProvider.on('error', (error) => socket.emit('warning', {info: error}));
			pullRequestListProvider.getPullRequestList().then((pullRequests) => {
				return generator.generateReport(data, pullRequests);
			}).then((report) => {
				console.log('Report generated!');
				return writer.writeFile(`tmp/${Date.now()}-report.csv`, report);
			}).catch((error) => {
				console.log('Report not generated', error);
				socket.emit('fail', {info: error});
			});
		});
	});

};