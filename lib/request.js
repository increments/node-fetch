
/**
 * request.js
 *
 * Request class contains server only options
 */

var parse_url = require('url').parse;

module.exports = Request;

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
function Request(input, init) {
	var url, url_parsed;

	// normalize input
	if (!(input instanceof Request)) {
		url = input;
		url_parsed = parse_url(url);
		input = {};
	} else {
		url = input.url;
		url_parsed = parse_url(url);
	}

	if (!url_parsed.protocol || !url_parsed.hostname) {
		throw new Error('only absolute urls are supported');
	}

	if (url_parsed.protocol !== 'http:' && url_parsed.protocol !== 'https:') {
		throw new Error('only http(s) protocols are supported');
	}

	// normalize init
	init = init || {};

	// fetch spec options
	this.method = init.method || input.method || 'GET';
	this.headers = init.headers || input.headers || {};
	this.body = init.body || input.body;
	this.url = url;

	this.maxRedirects = init.maxRedirects !== undefined ?
		init.maxRedirects : input.maxRedirects !== undefined ?
		input.maxRedirects : 20;
	this.followRedirect = (this.maxRedirects !== 0);
	this.counter = init.counter || input.follow || 0; // increments: unused in request()
	this.timeout = init.timeout || input.timeout || 0; // increments: unused in request()
	this.gzip = init.gzip !== undefined ?
		init.gzip : input.gzip !== undefined ?
		input.gzip : true;
	this.size = init.size || input.size || 0; // increments: unused in request()
	this.agent = init.agent || input.agent; // increments: unused in request()

  /* increments: original
	// server only options
	this.follow = init.follow !== undefined ?
		init.follow : input.follow !== undefined ?
		input.follow : 20;
	this.counter = init.counter || input.follow || 0;
	this.timeout = init.timeout || input.timeout || 0;
	this.compress = init.compress !== undefined ?
		init.compress : input.compress !== undefined ?
		input.compress : true;
	this.size = init.size || input.size || 0;
	this.agent = init.agent || input.agent;
  */

	// increments: may not be used
	// server request options
	this.protocol = url_parsed.protocol;
	this.hostname = url_parsed.hostname;
	this.port = url_parsed.port;
	this.path = url_parsed.path;
	this.auth = url_parsed.auth;
}
