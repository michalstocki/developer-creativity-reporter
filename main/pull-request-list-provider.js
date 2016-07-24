'use strict';

const bitbucketClient = require('./bitbucket-api-client');
const EventEmitter = require('events');

class PullRequestListProvider extends EventEmitter {

	constructor(username, repositoryNames) {
		super();
		this.username = username;
		this.repositoryNames = repositoryNames;
		this.progressPerRepo = 1 / repositoryNames.length;
		this.pullRequestsData = [];
	}

	getPullRequestList() {
		let lastPromise = new Promise((resolve => resolve()));
		this.repositoryNames.forEach((repositoryName) => {
			lastPromise = lastPromise.then(() => {
				return this.getPullRequests(repositoryName);
			}).catch((error) => {
				console.error(`Error while fetching data from ${repositoryName}:`, error);
				return this.getPullRequests(repositoryName);
			});
		});
		return lastPromise.then(() => {
			return this.pullRequestsData;
		});
	}

	getPullRequests(repositoryName) {
		return bitbucketClient.getPullRequestsByUser(this.username, repositoryName).then((pullRequests) => {
			[].push.apply(this.pullRequestsData, pullRequests);
			this.progress += this.progressPerRepo;
			this.emit('report-progress', this.progress);
		});
	}

}

module.exports = PullRequestListProvider;
