const config = require('../config.json');
const createBasicAuthHeader = require('basic-auth-header');
const moment = require('moment');

module.exports.getFilteredPullRequests = function(repositoryName, filters) {
	const fetch = require('node-fetch');
	let promise = fetch(`https://api.bitbucket.org/2.0/repositories/ydp/${repositoryName}/pullrequests?state=MERGED&state=OPEN`, {
		headers: {
			'Authorization': createBasicAuthHeader(config.bitbucketUser, config.bitbucketPass)
		}
	}).then(checkResponseStatus).then(json => json.values);
	
	if (filters.username) {
		promise = promise.then((pullRequests) => {
			return filterPullRequestsByUser(pullRequests, filters.username);
		});
	}
	
	if (filters.period) {
		promise = promise.then((pullRequests) => {
			return filterPullRequestsByPeriod(pullRequests, filters.period)
		});
	}

	return promise;
};

function checkResponseStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response.json();
	} else {
		return Promise.reject(`Status ${response.status} (${response.statusText})`);
	}
}

function filterPullRequestsByUser(pullRequests, username) {
	return pullRequests.filter((pullRequest) => pullRequest.author.username === username);
}

function filterPullRequestsByPeriod(pullRequests, period) {
	return pullRequests.filter(pullRequest => moment(pullRequest.created_on).isBetween(period.from, period.to));
}
