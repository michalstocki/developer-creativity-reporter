'use strict';

const bitbucketClient = require('./bitbucket-api-client');
const EventEmitter = require('events');
const moment = require('moment');

class PullRequestListProvider extends EventEmitter {

	constructor(data) {
		super();
		this.progress = 0;
		this.pullRequestsData = [];
		this.filters = {
			username: data.username,
			period: {
				from: moment(data.month, 'YYYY-MM').startOf('month'),
				to: moment(data.month, 'YYYY-MM').endOf('month')
			}
		};
	}

	getPullRequestList(repositoryNames) {
		this.repositoryNames = repositoryNames;
		this.progressPerRepo = 1 / this.repositoryNames.length;
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
		return bitbucketClient.getFilteredPullRequests(repositoryName, this.filters).then((pullRequests) => {
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
	user: ${this.filters.username},
	repositories: ${this.repositoryNames.join(', ')},
	period: from ${this.filters.period.from} to ${this.filters.period.to}.`);
	}

}

module.exports = PullRequestListProvider;
