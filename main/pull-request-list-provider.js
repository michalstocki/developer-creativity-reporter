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
		let lastPromise = Promise.resolve();
		this.repositoryNames.forEach((repositoryName) => {
			lastPromise = lastPromise.then(() => {
				return this._getPullRequests(repositoryName);
			}).catch((error) => {
				this.emit('error', `Error while fetching data from ${repositoryName}: ${error}`);
				return this._getPullRequests(repositoryName);
			});
		});
		return lastPromise.then(() => this._finish()).catch(() => this._finish());
	}

	_getPullRequests(repositoryName) {
		return bitbucketClient.getPullRequestsByUser(this.username, repositoryName).then((pullRequests) => {
			[].push.apply(this.pullRequestsData, pullRequests);
			this.progress += this.progressPerRepo;
			this.emit('report-progress', this.progress);
		});
	}

	_finish() {
		if (this.pullRequestsData.length > 0) {
			return this.pullRequestsData;
		} else {
			return this._fail();
		}
	}

	_fail() {
		return Promise.reject(`No pull requests for given criteria: 
	user: ${this.username},
	repositories: ${this.repositoryNames.join(', ')}.`);
	}

}

module.exports = PullRequestListProvider;
