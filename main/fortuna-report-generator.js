'use strict';

const repositoryListProvider = require('../main/repository-list-provider');
const PullRequestListProvider = require('../main/pull-request-list-provider');
const generator = require('../main/report/csv-report-generator');
const EventEmitter = require('events');
const fs = require('fs');

class FortunaReportGenerator extends EventEmitter {

	constructor(data) {
		super();
		this.progress = 0;
		this.inputData = data;
		this.pullRequestsProvider = new PullRequestListProvider(data);
	}

	generateCSVReportFile() {
		this.pullRequestsProvider.on('report-progress', (progress) => {
			this.emit('progress', {
				value: this._calculatePullRequestProgressIncrease(progress),
				state: `Getting Pull Requests data: ${this.pullRequestsProvider.pullRequestsData.length} items found.`
			});
		});
		this.pullRequestsProvider.on('error', (error) => this.emit('warning', {info: error}));
		this._emitProgress(0, 'Getting list of repositories for selected projects.');
		return repositoryListProvider.getRepositoriesForProjects(this.inputData.projects).then((repositories) => {
			this._emitProgress(0.1, 'Getting Pull Requests data.');
			const repositoryNames = repositories.map(r => r.name);
			return this.pullRequestsProvider.getPullRequestList(repositoryNames);
		}).then((pullRequests) => {
			this._emitProgress(0.89, 'Generating CSV report file.');
			return generator.generateCSVReportContents(this.inputData, pullRequests);
		}).then((report) => {
			this._emitProgress(0.01, 'Report generation completed!');
			return new Buffer(report);
		});
	}

	_calculatePullRequestProgressIncrease(prProgress) {
		const OVERALL_PULL_REQUEST_PHASE_PROGRESS_INCREASE = 0.89;
		return this.progress + prProgress * OVERALL_PULL_REQUEST_PHASE_PROGRESS_INCREASE;
	}

	_emitProgress(increase, message) {
		this.emit('progress', {
			value: this.progress += increase,
			state: message
		});
	}

}

module.exports = FortunaReportGenerator;