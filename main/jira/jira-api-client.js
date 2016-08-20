const config = require('../../config.json');
const createBasicAuthHeader = require('basic-auth-header');
const fetch = require('node-fetch');


module.exports.getLastUpdatedIssueAssignedTo = function(username) {
	return fetchJiraAPI(getSearchIssueByAssigneeUrl(username)).then((response) => {
		console.log('result:', JSON.stringify(response));
		return response.issues[0];
	});
};

function getSearchIssueByAssigneeUrl(username) {
	const projectKey = config.jira.projectKey;
	const jqlQuery = `project = ${projectKey} AND assignee = ${username} ORDER BY updatedDate`;
	return getJiraAPIRoot() + `search?jql=${jqlQuery}&maxResults=1&expand=transitions`;
}

function getJiraAPIRoot() {
	return `${config.jira.access.host}/rest/api/2/`
}

function fetchJiraAPI(bitbucketAPIURL) {
	return fetch(bitbucketAPIURL, {
		headers: {
			'Authorization': createBasicAuthHeader(config.jira.access.user, config.jira.access.password),
			'Content-Type': 'application/json'
		}
	}).then(checkResponseStatus);
}

function checkResponseStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response.json();
	} else {
		return Promise.reject(`Status ${response.status} (${response.statusText})`);
	}
}