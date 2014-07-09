'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.cachebuster_querystring = {
	scripts: function(test){
		test.expect(8);

        var scripts = grunt.file.read('tmp/scripts.html');
		console.log(scripts);
        test.ok(scripts.match(/script1\.js\?[a-z0-9]/), 'testing script1');
        test.ok(scripts.match(/script2\.js\?[a-z0-9]/), 'testing script2');
        test.ok(scripts.match(/script3\.js\?[a-z0-9]/), 'testing script3');
        test.ok(scripts.match(/script4\.js\?[a-z0-9]/), 'testing script4');

        test.ok(scripts.match(/src="\/\/ajax.googleapis.com\/ajax\/libs\/angularjs\/1.0.6\/angular.min.js"/), 'remotely hosted // syntax should remain untouched');
        test.ok(scripts.match(/src="https:\/\/ajax.googleapis.com\/ajax\/libs\/jquery\/1.10.2\/jquery.min.js"/), 'remotely hosted https:// syntax should remain untouched');
        test.ok(scripts.match(/src="http:\/\/code.jquery.com\/qunit\/qunit-1.12.0.js"/), 'remotely hosted http:// syntax should remain untouched');

        test.ok(scripts.match(/defer src="assets\/script1.js\?[a-z0-9]/), 'testing script1 again to see if duplicates are busted');

        test.done();
	}
};
