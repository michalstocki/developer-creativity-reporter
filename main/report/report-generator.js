const header = require('./template/header');
const body = require('./template/body');
const footer = require('./template/footer');

module.exports.generateReport = function(formData, pullRequests) {
	const person = {
		fullName: pullRequests[0].author.display_name,
		creativityPercent: 80,//formData.creativityPercent,
		position: 'Programista', //formData.position,
		username: formData.username
	};

	const period = {
		monthName: 'Lipiec', //new Date().getMonth(),
		month: '0' + (new Date().getMonth() + 1),
		year: new Date().getFullYear()
	};

	const reportContent = header.getReportHeader(period, person) +
			body.getReportBody(period, person, pullRequests) +
			footer.getReportFooter(period, person);

	console.log(reportContent);
};