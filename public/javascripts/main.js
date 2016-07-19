var socket = io.connect(document.location.href);
var form = document.getElementById('report-form');
form.addEventListener("submit", (event) => {
	event.preventDefault();
	const data = getFormData();
	sendReportRequest(data);
}, false);


function getFormData() {
	var username = document.getElementById('username').value;
	var projectRadioInputs = [].slice.call(document.getElementsByClassName('repositories'));
	var repositoryList = projectRadioInputs.filter(input => input.checked)[0].value;
	return {
		username: username,
		repositories: repositoryList.split(',')
	}
}

function sendReportRequest(data) {
	socket.emit('get-report', data);
}

function setStatus(text) {
	document.getElementById('status').textContent = text;
}

socket.on('drilling-bitbucket-progress', function (data) {
	setStatus('Zaciąganie danych o pull requestach z Bitbucketa: ' + (data.progress * 100) + '%')
});
