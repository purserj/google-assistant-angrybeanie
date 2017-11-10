'use strict';

const { ApiAiApp } = require('actions-on-google');
const functions = require('firebase-functions');

process.env.DEBUG = 'actions-on-google:*';

exports.getRequest = function getRequest(req, res) {
	var fulfillmentRequest = req.body;
	var intent = req.body.result.metadata['intentName'];
	console.log(req.body.result)
	if(intent == "Give me a list of your podcasts") {
		listPodcasts(res)
	} else if(intent == "EpisodesAvailable") {
		getPodcasts(res, req.body.result.parameters);
	} else if(intent == "PlayLatest") {
		playLatestPodcast(res, req.body.result.parameters);
	}
};

function listPodcasts(res) {
	var response = "The available podcasts are: Women In STEMM, Purser Explores The World and For Science!";
	res.setHeader('Content-type', 'application/json');
	res.send(JSON.stringify({ 'speech': response, 'displayText': response}));
}

function getPodcasts (res, params) {
	var parser = require('rss-parser');
	var response = "Available episodes are ";

	console.log("Params are: "+params.PodcastName);

	var feedURL = getPodcastURL(params.PodcastName);

	parser.parseURL(feedURL, function(err, parsed) {
		parsed.feed.entries.forEach(function(entry) {
			response+=","+entry.title;
		})
	res.setHeader('Content-type', 'application/json');
	res.send(JSON.stringify({ 'speech': response, 'displayText': response}));
	})
};

function playLatestPodcast(res, params) {
	var parser = require('rss-parser');
	var response = "";

	var feedURL = getPodcastURL(params.PodcastName);

	parser.parseURL(feedURL, function(err, parsed) {
		var entry = parsed.feed.entries[0];
		console.log(entry);
		var mp3 = entry.enclosure.url;
		console.log(mp3);
		response+='<speak>Now playing '+entry.title+'. <audio src="'+mp3+'">Oops can\'t get the mp3</audio></speak>';
		var responseDisplay="Now playing"+entry.title;
		console.log(response);
		res.setHeader('Content-type', 'application/json');
		res.send(JSON.stringify({ 'speech': response, 'displayText': responseDisplay}));
	})
};

function getPodcastURL(PodcastName) {

	var wistemmURL = 'https://dev.angrybeanie.com/feed/wistemm';
	var forscienceURL = 'https://dev.angrybeanie.com/feed/forscience';
	var petwURL = 'https://dev.angrybeanie.com/feed/petw'

	if(PodcastName == 'Women In STEMM' || PodcastName == 'Women In STEM') {
		var feedURL = wistemmURL;
	} else if (PodcastName == 'For Science') {
		var feedURL = forscienceURL;
	} else if (PodcastName == 'Purser Explores The World') {
		var feedURL = petwURL;
	}

	return feedURL;
}
