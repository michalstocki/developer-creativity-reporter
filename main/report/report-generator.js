const header = require('./template/header');
const body = require('./template/body');
const footer = require('./template/footer');
const moment = require('moment');
const getUserInfo = require('./user-info-provider').getUserInfo;

module.exports.generateReport = function(inputData, pullRequests) {
	moment.locale('pl');

	return getUserInfo(inputData, pullRequests).then((user) => {
		const period = {
			monthName: moment().format('MMMM'),
			month: moment().format('MM'),
			year: moment().format('YYYY')
		};
		return header.getReportHeader(period, user) +
			body.getReportBody(period, user, pullRequests) +
			footer.getReportFooter(period, user);
	});
};