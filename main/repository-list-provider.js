const apiClient = require('./bitbucket-api-client');

module.exports.getRepositoriesForProjects = function(projectKeys) {
	return apiClient.getRepositoriesByProject(projectKeys[0]);
};