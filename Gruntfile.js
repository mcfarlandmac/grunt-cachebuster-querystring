/*
 * grunt-cachebuster-querystring
 * https://github.com/mcfarlandmac/grunt-cachebuster-querystring
 *
 * Copyright (c) 2014 Matt McFarland
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
	clean: {
        tmp: 'tmp'
    },

	jshint: {
		all: [
			'Gruntfile.js',
			'tasks/*.js',
			'<%= nodeunit.tests %>'
		],
		options: {
			jshintrc: '.jshintrc'
		}
	},
	
	copy: {
		main: {
			files: [{
				expand: true,
				cwd: 'test/fixtures',
				src: ['**'],
				dest: 'tmp/'
			}]
		}
	},

    // Configuration to be run (and then tested).
    cachebuster_querystring: {
      default: {
        options: {
        },
        files: [{
			src: 'tmp/*.html'
		}]
      }
    },

    nodeunit: {
		tests: ['test/*_test.js']
	},

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['clean', 'copy', 'cachebuster_querystring', 'nodeunit']);
};
