const apiClient = require('./bitbucket-api-client');

module.exports.getRepositoriesForProjects = function(projectKeys) {
	const repositoryList = [];
	let lastPromise = Promise.resolve();
	projectKeys.forEach((projectKey) => {
		lastPromise = lastPromise.then(() => {
			return getRepositoriesForProjects(projectKey, repositoryList);
		}).catch((error) => {
			console.log(`Error while fetching data from ${projectKey}: ${error}`);
			return getRepositoriesForProjects(projectKey, repositoryList);
		});
	});
	return lastPromise.then(() => _finish(repositoryList, projectKeys)).catch(() => _finish(repositoryList, projectKeys));
};

function getRepositoriesForProjects(projectKey, repositoryList) {
	return apiClient.getRepositoriesByProject(projectKey).then((repositories) => {
		[].push.apply(repositoryList, repositories);
	});
}

function _finish(repositoryList, projectKeys) {
	if (repositoryList.length > 0) {
		return repositoryList;
	} else {
		return Promise.reject(`No repositories for projects: ${projectKeys.join(', ')}.`);
	}
}