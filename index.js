// init
const express = require('express');
const cors = require('cors');
const path = require('path');
const parser = require('body-parser');
const app = express();
const router = express.Router();
const api = require('./api/routes');
const config = require(process.env.HOME + '/vaporware.json');
const slackbot = require('./slackbot');


// survive CORS
app.use(cors());


// set up parser
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());


// display web pages
app.use(express.static(path.join(__dirname, 'public')));


// set up api router
app.use('/api', router);
api(router);


// start slackbot if enabled
slackbot.start();


// listen on given port
app.listen(config.port, () => {
	console.log(`Vaporware started on port ${config.port}`)
});