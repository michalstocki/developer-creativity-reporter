var express = require('express');
var router = express.Router();
const bitbucketAPIClient = require('../main/bitbucket-api-client');

/* GET home page. */
router.get('/', function(req, res, next) {
	bitbucketAPIClient.getProjects().then((projects) => {
		res.render('index', {title: 'Fortuna reporter', projects: projects});
	});
});

module.exports = router;
