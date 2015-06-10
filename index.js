
/**
 * index.js
 *
 * a request API compatible with window.fetch
 */

var parse_url = require('url').parse;
var resolve_url = require('url').resolve;
var request = require('request');
var stream = require('stream');

var Response = require('./lib/response');
var Headers = require('./lib/headers');
var Request = require('./lib/request');

module.exports = Fetch;

/**
 * Fetch class
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function Fetch(url, opts) {

	// allow call as function
	if (!(this instanceof Fetch))
		return new Fetch(url, opts);

	// allow custom promise
	if (!Fetch.Promise) {
		throw new Error('native promise missing, set Fetch.Promise to your favorite alternative');
	}

	Response.Promise = Fetch.Promise;

	var self = this;

	// wrap http.request into fetch
	return new Fetch.Promise(function(resolve, reject) {
		// build request object
		var options;
		try {
			options = new Request(url, opts);
		} catch (err) {
			reject(err);
			return;
		}

		// normalize headers
		var headers = new Headers(options.headers);

		if (!headers.has('user-agent')) {
			headers.set('user-agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
		}

		if (!headers.has('connection')) {
			headers.set('connection', 'close');
		}

		if (!headers.has('accept')) {
			headers.set('accept', '*/*');
		}

		options.headers = headers.raw();

		request(options, function(err, res, body) {
			if (err) {
				reject(new Error('request to ' + options.url + ' failed, reason: ' + err.message));
				return;
			}

			var headers = new Headers(res.headers);

			// FIXME: get a real streaming response body
			var bodyStream = new stream.Readable();
			bodyStream.push(body);
			bodyStream.push(null);

			var output = new Response(bodyStream, {
				url: options.url
				, status: res.statusCode
				, headers: headers
				, size: options.size
				, timeout: options.timeout
			});

			resolve(output);
		});

		/* FIXME: accept stream as request body
		// accept string or readable stream as body
		if (typeof options.body === 'string') {
			req.write(options.body);
			req.end();
		} else if (typeof options.body === 'object' && options.body.pipe) {
			options.body.pipe(req);
		} else {
			req.end();
		}
		*/
	});

};

// expose Promise
Fetch.Promise = global.Promise;
Fetch.Response = Response;
Fetch.Headers = Headers;
Fetch.Request = Request;
