'use strict';

const driller = require('./bitbucket-pullrequest-driller');

module.exports = function(server) {

	const io = require('socket.io')(server);

	io.on('connection', function(socket) {
		socket.on('get-report', function(data) {
			let progress = 0;
			let progressPerRepo = 1 / data.repositories.length;
			let lastPromise;
			data.repositories.forEach((repositoryName) => {
				if (lastPromise) {
					lastPromise = lastPromise.then(() => {
						return getPullRequests(repositoryName);
					}).catch((error) => {
						console.error('Errorddd:', error);
						return getPullRequests(repositoryName);
					});
				} else {
					lastPromise = getPullRequests(repositoryName);
				}
			});

			function getPullRequests(repositoryName) {
				driller.getPullRequestsByUser(data.username, repositoryName).then((pullRequests) => {
					console.log(`${data.username} in ${repositoryName} has a following pull requests:
${pullRequests.map((pr) => `* ${pr.title} (${pr.state})`).join(',\n')}`);
					progress += progressPerRepo;
					socket.emit('drilling-bitbucket-progress', {
						progress: progress
					});
				});
			}
			
			console.log(data);
		});
	});

};