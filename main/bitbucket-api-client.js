const config = require('../config.json');
const createBasicAuthHeader = require('basic-auth-header');
const fetch = require('node-fetch');

module.exports.getFilteredPullRequests = function(repositoryName, filters) {
	return fetchCollection(getPullRequestsAPIUrl(repositoryName, filters));
};

module.exports.getProjects = function() {
	return fetchCollection(getProjectsAPIUrl());
};

module.exports.getRepositoriesByProject = function(projectKey) {
	return fetchCollection(getProjectRepositoriesAPIUrl(projectKey));
};

function getPullRequestsAPIUrl(repositoryName, filters) {
	const teamName = config.bitbucket.team;
	const fromTime = filters.period.from.toISOString().substr(0, 19);
	const toTime = filters.period.to.toISOString().substr(0, 19);
	const queryString = `author.username = "${filters.username}" AND created_on > ${fromTime} AND created_on < ${toTime}`;
	const encodedQuery = encodeURIComponent(queryString);
	return `https://api.bitbucket.org/2.0/repositories/${teamName}/${repositoryName}/pullrequests?state=MERGED&state=OPEN&q=${encodedQuery}`;
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

function fetchBitbucketAPI(bitbucketAPIURL) {
	return fetch(bitbucketAPIURL, {
		headers: {
			'Authorization': createBasicAuthHeader(config.bitbucket.access.user, config.bitbucket.access.password)
		}
	}).then(checkResponseStatus);
}

function loadNextPage(responseObject) {
	let nextPageData = responseObject;
	if (responseObject.next) {
		nextPageData = fetchBitbucketAPI(responseObject.next).then(resObject => {
			[].unshift.apply(resObject.values, responseObject.values);
			return loadNextPage(resObject);
		});
	}
	return nextPageData;
}

function checkResponseStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response.json();
	} else {
		return Promise.reject(`Status ${response.status} (${response.statusText})`);
	}
}