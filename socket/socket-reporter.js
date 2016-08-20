'use strict';

const ForutnaReportGenerator = require('../main/fortuna-report-generator');
const jiraClient = require('../main/jira/jira-api-client');

module.exports = function(server) {

	const io = require('socket.io')(server);

	io.on('connection', function(socket) {
		socket.on('get-report', function(data) {
			const reportGenerator = new ForutnaReportGenerator(data);
			reportGenerator.on('progress', (progress) => socket.emit('progress', progress));
			reportGenerator.on('warning', (warning) => socket.emit('warning', warning));
			const reportFilename = `fortuna-report-${data.username}-${Date.now()}.csv`;
			reportGenerator.generateCSVReportFile().then((fileBuffer) => {
				socket.emit('report-file', {buffer: fileBuffer, filename: reportFilename});
			}).catch((error) => {
				console.log('Report not generated', error);
				socket.emit('fail', {info: error});
			});
		});
		
		socket.on('get-issue-details', function(data) {
			console.log('get-issue-details received');
			jiraClient.getLastUpdatedIssueAssignedTo(data.username).then((issue) => {
				socket.emit('issue-details', {
					key: issue.key,
					summary: issue.fields.summary,
					assignee: {
						displayName: issue.fields.assignee.displayName,
						avatarUrl: issue.fields.assignee.avatarUrls['32x32']
					},
					type: {
						name: issue.fields.issuetype.name,
						iconUrl: issue.fields.issuetype.iconUrl
					},
					priority: {
						name: issue.fields.priority.name,
						iconUrl: issue.fields.priority.iconUrl
					}
				})
			}).catch((error) => {
				console.log('Issue Error:', error);
			});
		})
	});

};