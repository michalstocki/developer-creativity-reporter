const fs = require('fs');


module.exports.writeFile = function(name, contents) {
	return new Promise((resolve, reject) => {
		fs.writeFile(name, contents, function(err) {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});

	});
};