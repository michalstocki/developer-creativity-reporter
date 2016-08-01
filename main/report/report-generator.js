const header = require('./template/header');
const body = require('./template/body');
const footer = require('./template/footer');
const moment = require('moment');

module.exports.generateReport = function(formData, pullRequests) {
	moment.locale('pl');

	const person = {
		fullName: pullRequests[0].author.display_name,
		creativityPercent: 80,//formData.creativityPercent,
		position: 'Programista', //formData.position,
		username: formData.username
	};

	const period = {
		monthName: moment().format('MMMM'),
		month: moment().format('MM'),
		year: moment().format('YYYY')
	};

	return header.getReportHeader(period, person) +
		body.getReportBody(period, person, pullRequests) +
		footer.getReportFooter(period, person);
};