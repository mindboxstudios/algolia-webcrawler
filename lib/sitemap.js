/**
 * Parse sitemaps
 */

'use strict';

var _ = require('lodash');
var URL = require('url');
var http = require('http');
var cheerio = require('cheerio');

module.exports = function (config, cb) {
	_.each(config.sitemaps, function (sitemap) {
		var urls = [];
		var parsedUrl = URL.parse(sitemap.url);
		var httpOptions = {
			hostname: parsedUrl.hostname,
			port: parsedUrl.port || 80,
			path: parsedUrl.pathname,
			method: 'GET',
			auth: config.http.auth
		};
		
		http.request(httpOptions, function (res) {
			var data = '';
			
			res.setEncoding('utf8');
			
			res.on('data', function (chunk) {
				data += chunk;
			});
			
			res.on('end', function (chunk, encoding) {
				if (!!chunk) {
					data += chunk;
				}
				
				try {
					var $ = cheerio.load(data);
					
					_.each($('url > loc'), function (loc) {
						urls.push({
							url: loc.children[0].data,
							lang: sitemap.lang
						});
					});
					
					cb(sitemap, urls);
				
				} catch (ex) {
					console.error(ex.message);
					console.log(ex.stack);
				}
			});
		}).end();
	});
};