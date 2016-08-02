const positionMap = {
	developer: {
		name: 'Programista',
		creativityPercent: 80
	},
	tester: {
		name: 'Tester',
		creativityPercent: 60
	},
	manager: {
		name: 'Kierownik zespołu',
		creativityPercent: 40
	}
};

module.exports.getUserInfo = function(inputData, pullRequests) {
	return new Promise((resolve, reject) => {
		const position = positionMap[inputData.position];
		if (position) {
			resolve({
				fullName: pullRequests[0].author.display_name,
				creativityPercent: position.creativityPercent,
				position: position.name,
				username: inputData.username
			});
		} else {
			reject(`Invalid position name: ${inputData.position}`);
		}
	});
};