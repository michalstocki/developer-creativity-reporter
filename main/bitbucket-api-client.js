const config = require('../config.json');
const createBasicAuthHeader = require('basic-auth-header');
const moment = require('moment');
const fetch = require('node-fetch');

function getFilteredPullRequests(repositoryName, filters) {
	return fetchPullRequests(repositoryName)
		.then(checkResponseStatus)
		.then(json => json.values)
		.then(pullRequests => filterPullRequests(pullRequests, filters));
}

function fetchPullRequests(repositoryName) {
	return fetch(`https://api.bitbucket.org/2.0/repositories/ydp/${repositoryName}/pullrequests?state=MERGED&state=OPEN`, {
		headers: {
			'Authorization': createBasicAuthHeader(config.bitbucketUser, config.bitbucketPass)
		}
	});
}

function filterPullRequests(pullRequests, filters) {
	if (filters.username) {
		pullRequests = filterPullRequestsByUser(pullRequests, filters.username);
	}
	if (filters.period) {
		pullRequests = filterPullRequestsByPeriod(pullRequests, filters.period);
	}
	return pullRequests;
}

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

module.exports.getFilteredPullRequests = getFilteredPullRequests;