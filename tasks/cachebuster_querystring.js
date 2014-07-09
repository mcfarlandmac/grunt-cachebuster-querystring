/*
 * grunt-cachebuster-querystring
 * https://github.com/mcfarlandmac/grunt-cachebuster-querystring
 *
 * Copyright (c) 2014 Matt McFarland
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
	var cheerio = require('cheerio');
	var path    = require('path');
	var crypto  = require('crypto');
	var date = new Date();
	
	var cheerioOptions = {
        ignoreWhitespace: true,
        lowerCaseTags: true
    };
	
	var remoteRegex    = /http:|https:|\/\/|data:image/;
    var extensionRegex = /(\.[a-zA-Z0-9]{2,4})(|\?.*)$/;
    var urlFragHintRegex = /'(([^']+)#grunt-cache-bust)'|"(([^"]+)#grunt-cache-bust)"/g;
	
	var regexEscape = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
	
	var options = {
		algorithm: 'md5',
		length: 16
	};
	
	var filters = {
		'script' : function() {
            return this.attribs['src'];
        },
        'link[rel="stylesheet"]' : function() {
            return this.attribs['href'];
        }
	};
	
	var checkIfRemote = function(href) {
        return remoteRegex.test(href);
    };
	
	var checkIfHasExtension = function(href) {
        return extensionRegex.test(href);
    };
	
	var checkIfValidFile = function(href) {
        return !checkIfRemote(href) && checkIfHasExtension(href);
    };
	
	var checkIfElemSrcValidFile = function() {
        return checkIfValidFile(this.attr('src') || this.attr('href'));
    };
	
	var findStaticAssets = function(data, filters) {
        var $ = cheerio.load(data, cheerioOptions);
		
        // Add any conditional statements or assets in comments to the DOM
        var assets = '';

        $('head, body').contents().filter(function() {
            return this[0].type === 'comment';
        }).each(function(i, e) {
            assets += e.data.replace(/\[.*\]>|<!\[endif\]/g, '').trim();
        });

        $('body').append(assets);

        var paths = [];

        Object.keys(filters).forEach(function(key) {
            var mappers = filters[key];

            var addPaths = function(mapper) {
                var i,
                    item,

                    foundPaths = $(key)
                    .filter(checkIfElemSrcValidFile)
                    .map(mapper)
                    .filter(function(path, el){
                        var rtn = false;

                        if(el) {
                            rtn = true;
                        }

                        return rtn;
                    });

                for(i = 0; i < foundPaths.length; i++){
                    paths = paths.concat(foundPaths[i]);
                }
            };

            if (grunt.util.kindOf(mappers) === 'array') {
                mappers.forEach(addPaths);
            } else {
                addPaths(mappers);
            }
        });

        return paths.filter(function(path, index) {
            return paths.indexOf(path) === index;
        });
    };
	
	grunt.registerMultiTask('cachebuster_querystring', 'A simple grunt plugin that appends querystrings for cachebusting.', function() {
		var options = grunt.util._.defaults(this.options(), options);
		
		this.files.forEach(function(file) {
			var src = file.src.filter(function(filepath) {

                // Warn on and remove invalid source files
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }

            }).map(function(filepath) {
                var markup = grunt.file.read(filepath);

                findStaticAssets(markup, filters).forEach(function(reference) {
                    var newFilename;
                    var newFilePath;

                    var filePath = (options.baseDir ? options.baseDir : path.dirname(filepath)) + '/';
                    var filename = path.normalize((filePath + reference).split('?')[0]);
                    var extension = path.extname(filename);
                    
					newFilename = reference.split('?')[0] + '?v=' + date.getTime();
					markup = markup.replace(new RegExp(regexEscape(reference), 'g'), newFilename);
                });

				grunt.file.write(filepath, markup);
                grunt.log.writeln(filepath + ' was busted!');
            });
		});
	});
};
