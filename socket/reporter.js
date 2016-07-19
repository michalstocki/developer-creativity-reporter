module.exports = function(server) {

	var io = require('socket.io')(server);

	io.on('connection', function(socket) {
		socket.on('get-report', function(data) {
			var progress = 0;
			var progressPerRepo = 1 / data.repositories.length;
			data.repositories.forEach((repositoryName, index) => {
				setTimeout(() => {
					progress += progressPerRepo;
					socket.emit('drilling-bitbucket-progress', {
						progress: progress
					});
				}, (index) * 2000)
			});

			console.log(data);
		});
	});

};