module.exports.getReportBody = function(period, person, pullRequests) {
	let reportBody = `
;Nr utworu;Tytuł;Opis Utworu ;Link do utworu;Kod projektu;`;
	pullRequests.forEach((pr, index) => {
		reportBody += `
;${getId(period, person, index)};${getTitle(pr)};${pr.title};${pr.links.html.href};;`
	});
	return reportBody;
};

function getId(period, person, index) {
	const yearCode = period.year.toString().substr(2, 2);
	return `${yearCode}${period.month}_${person.username}_${index + 1}`
}

function getTitle(pr) {
	return `Pull Request numer ${pr.id} w projekcie ${pr.destination.repository.name}`;
}
