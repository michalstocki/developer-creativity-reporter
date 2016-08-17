'use strict';

const PullRequestListProvider = require('../main/pull-request-list-provider');
const generator = require('../main/report/csv-report-generator');
const EventEmitter = require('events');
const fs = require('fs');

class FortunaReportGenerator extends EventEmitter {

	constructor(data) {
		super();
		this.inputData = data;
		this.pullRequestsProvider = new PullRequestListProvider(data);
	}

	generateCSVReportFile() {
		this.pullRequestsProvider.on('report-progress', (progress) => {
			this.emit('progress', {
				value: progress,
				state: `Obtaining data from Bitbucket: ${this.pullRequestsProvider.pullRequestsData.length} items found.`
			});
		});
		this.pullRequestsProvider.on('error', (error) => this.emit('warning', {info: error}));
		return this.pullRequestsProvider.getPullRequestList().then((pullRequests) => {
			return generator.generateCSVReportContents(this.inputData, pullRequests);
		}).then((report) => {
			console.log('Report generated!');
			return new Buffer(report);
		});
	}

}

module.exports = FortunaReportGenerator;