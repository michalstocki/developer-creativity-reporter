const config = require('../config.json');
const createBasicAuthHeader = require('basic-auth-header');
const moment = require('moment');
const fetch = require('node-fetch');

module.exports.getFilteredPullRequests = function(repositoryName, filters) {
	return fetchFilteredPullRequests(getPullRequestsAPIUrl(repositoryName), filters);
};

module.exports.getProjects = function() {
	return fetchCollection(getProjectsAPIUrl());
};

module.exports.getRepositoriesByProject = function(projectKey) {
	return fetchCollection(getProjectRepositoriesAPIUrl(projectKey));
};

function getPullRequestsAPIUrl(repositoryName) {
	const teamName = config.bitbucket.team;
	return `https://api.bitbucket.org/2.0/repositories/${teamName}/${repositoryName}/pullrequests?state=MERGED&state=OPEN`;
}

function getProjectsAPIUrl() {
	return `https://api.bitbucket.org/2.0/teams/${config.bitbucket.team}/projects/`;
}

function getProjectRepositoriesAPIUrl(projectKey) {
	const query = encodeURIComponent(`project.key="${projectKey}"`);
	return `https://api.bitbucket.org/2.0/repositories/ydp?q=${query}`;
}

function fetchCollection(apiURL) {
	return fetchBitbucketAPI(apiURL)
		.then(responseObject => loadNextPage(responseObject))
		.then(responseObject => responseObject.values)
}

function fetchFilteredPullRequests(apiURL, filters) {
	return fetchBitbucketAPI(apiURL)
		.then(responseObject => loadNextPage(responseObject, filters))
		.then(responseObject => responseObject.values)
		.then(pullRequests => filterPullRequests(pullRequests, filters));
}

function fetchBitbucketAPI(bitbucketAPIURL) {
	return fetch(bitbucketAPIURL, {
		headers: {
			'Authorization': createBasicAuthHeader(config.bitbucket.access.user, config.bitbucket.access.password)
		}
	}).then(checkResponseStatus);
}

function loadNextPage(responseObject, filters) {
	let nextPageData = responseObject;
	if (responseObject.next && canNextPageSatisfyFilter(responseObject, filters)) {
		nextPageData = fetchBitbucketAPI(responseObject.next).then(resObject => {
			[].unshift.apply(resObject.values, responseObject.values);
			return loadNextPage(resObject, filters);
		});
	}
	return nextPageData;
}

function canNextPageSatisfyFilter(pullRequestObject, filters) {
	let result = true;
	const lastResult = pullRequestObject.values[pullRequestObject.values.length - 1];
	if (filters && filters.period && moment(lastResult.created_on).isBefore(filters.period.from)) {
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