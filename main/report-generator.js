'use strict';

const driller = require('./../main/bitbucket-pullrequest-driller');
const EventEmitter = require('events');

class ReportGenerator extends EventEmitter {

	constructor(username, repositoryNames) {
		this.username = username;
		this.repositoryNames = repositoryNames;
		this.progressPerRepo = 1 / repositoryNames.length;
	}

	generateCSV() {
		let lastPromise;
		this.repositoryNames.forEach((repositoryName) => {
			if (lastPromise) {
				lastPromise = lastPromise.then(() => {
					return this.getPullRequests(repositoryName);
				}).catch((error) => {
					console.error('Errorddd:', error);
					return this.getPullRequests(repositoryName);
				});
			} else {
				lastPromise = this.getPullRequests(repositoryName);
			}
		});
		return lastPromise;
	}

	getPullRequests(repositoryName) {
		driller.getPullRequestsByUser(this.username, repositoryName).then((pullRequests) => {
			console.log(`${this.username} in ${repositoryName} has a following pull requests:
${pullRequests.map((pr) => `* ${pr.title} (${pr.state})`).join(',\n')}`);
			this.progress += this.progressPerRepo;
			this.emit('report-progress', this.progress);
		});
	}

}

module.exports = ReportGenerator;
