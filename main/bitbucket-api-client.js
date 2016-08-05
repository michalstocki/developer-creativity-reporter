const config = require('../config.json');
const createBasicAuthHeader = require('basic-auth-header');
const moment = require('moment');
const fetch = require('node-fetch');

module.exports.getFilteredPullRequests = function(repositoryName, filters) {
	return fetchFilteredPullRequests(getRequestUrl(repositoryName), filters);
};

function getRequestUrl(repositoryName) {
	return `https://api.bitbucket.org/2.0/repositories/ydp/${repositoryName}/pullrequests?state=MERGED&state=OPEN`;
}

function fetchFilteredPullRequests(apiURL, filters) {
	return fetchPullRequestsObject(apiURL)
		.then(pullRequestsObject => loadNextPage(pullRequestsObject, filters))
		.then(pullRequestsObject => pullRequestsObject.values)
		.then(pullRequests => filterPullRequests(pullRequests, filters));
}

function fetchPullRequestsObject(bitbucketAPIURL) {
	return fetch(bitbucketAPIURL, {
		headers: {
			'Authorization': createBasicAuthHeader(config.bitbucketUser, config.bitbucketPass)
		}
	}).then(checkResponseStatus);
}

function loadNextPage(pullRequestsObject, filters) {
	let nextPageData = pullRequestsObject;
	if (pullRequestsObject.next && canNextPageSatisfyFilter(pullRequestsObject, filters)) {
		nextPageData = fetchPullRequestsObject(pullRequestsObject.next).then(prObject => {
			[].unshift.apply(prObject.values, pullRequestsObject.values);
			return loadNextPage(prObject, filters);
		});
	}
	return nextPageData;
}

function canNextPageSatisfyFilter(pullRequestObject, filters) {
	let result = true;
	const lastResult = pullRequestObject.values[pullRequestObject.values.length - 1];
	if (filters.period && moment(lastResult.created_on).isBefore(filters.period.from)) {
		result = false;
	}
	return result;
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