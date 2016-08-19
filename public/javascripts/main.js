var local = new Date();
local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
document.getElementById('month').value = local.toJSON().slice(0, 7);

var socket = io.connect(document.location.href);
var form = document.getElementById('report-form');
form.addEventListener('submit', (event) => {
	event.preventDefault();
	var data = getFormData();
	sendReportRequest(data);
	document.getElementById('submit-form').disabled = true;
}, false);


function getFormData() {
	var username = document.getElementById('username').value;
	var position = document.getElementById('position').value;
	var date = document.getElementById('month').value;
	var projects = [].filter.call(document.getElementsByName('project'), function(c) {
		return c.checked;
	}).map(function(c) {
		return c.value;
	});
	return {
		username: username,
		projects: projects,
		position: position,
		month: date
	}
}

function sendReportRequest(data) {
	socket.emit('get-report', data);
}

function setStatus(text, progress) {
	document.getElementById('status').textContent = text;
	document.getElementById('progress-bar').style.width = progress + '%';
}

socket.on('report-file', function(event) {
	document.getElementById('submit-form').disabled = false;
	var blob = new Blob([event.buffer], {type: 'text/csv'});
	var objectURL = URL.createObjectURL(blob);

	var a = document.createElement('a');
	a.download = event.filename;
	a.href = objectURL;
	a.click();
});

socket.on('progress', function(progress) {
	setStatus(progress.state, Math.round(progress.value * 100))
});

socket.on('fail', function(error) {
	document.getElementById('submit-form').disabled = false;
	console.error(error.info);
});

socket.on('warning', function(warn) {
	console.warn(warn.info);
});
