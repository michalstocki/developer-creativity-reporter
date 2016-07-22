const config = require('../config.json');
const createBasicAuthHeader = require('basic-auth-header');

module.exports.getPullRequestsByUser = function(username, repositoryName) {
	const fetch = require('node-fetch');
	return fetch(`https://api.bitbucket.org/2.0/repositories/ydp/${repositoryName}/pullrequests?state=MERGED&state=OPEN`, {
		headers: {
			'Authorization': createBasicAuthHeader(config.bitbucketUser, config.bitbucketPass)
		}
	}).then((response) => {
		return response.json();
	}).then((json) => {
		return filterPullRequestsByUser(username, json.values);
	});
};

function filterPullRequestsByUser(username, pullRequests) {
	return pullRequests.filter((pullRequest) => pullRequest.author.username === username);
}

