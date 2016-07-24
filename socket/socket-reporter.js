'use strict';

const PullRequestListProvider = require('../main/pull-request-list-provider');

module.exports = function(server) {

	const io = require('socket.io')(server);

	io.on('connection', function(socket) {
		socket.on('get-report', function(data) {
			const pullRequestListProvider = new PullRequestListProvider(data.username, data.repositories);
			pullRequestListProvider.on('report-progress', (progress) => {
				socket.emit('drilling-bitbucket-progress', {progress: progress});
			});
			pullRequestListProvider.getPullRequestList().then((pullRequests) => {
				console.log(`${data.username} has a following pull requests:
${pullRequests.map((pr) => `* ${pr.destination.repository.name}: ${pr.title} (${pr.state})`).join(',\n')}`);
				console.log('Report generated!');
			});
		});
	});

};