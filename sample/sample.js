var _ = require('underscore');
var fs = require('fs');

var benchmark = require('../src/benchmark-js').benchmark;
var add = require('../src/benchmark-js').add;
var beforeEach = require('../src/benchmark-js').beforeEach;
var afterEach = require('../src/benchmark-js').afterEach;

benchmark('benchmark examples - suite 1', function () {

    beforeEach(function () {
        // setup test system
    });

    afterEach(function () {
        // dispose test system
    });

    // anonymous benchmark function
    add (function () {
        var range = _.range(1000000);
    });

    // use callback without any parameters for benchmarking sync code
    add ('iterating throught the range of numbers', function () {
        var count = 0;
        _.each(_.range(1000000), function () {
            count++;
        });
    });

    // in case of async methods, use done()
    add ('reading file contents', function (done) {
        fs.readFile('benchmark.js', 'utf-8', function (err, data) {
            done();
        });
    });

    // repeat the function several times to get total time of execution
    add ('iterating throught the range of numbers', {repeat: 3}, function () {
        var count = 0;
        _.each(_.range(1000000), function () {
            count++;
        });
    });

    // repeat the function several times to get average time of execution
    add ('iterating throught the range of numbers', {repeat: 3, average: true }, function () {
        var count = 0;
        _.each(_.range(1000000), function () {
            count++;
        });
    });

    // same for async call - repeat the function several times to get total time of execution
    add ('reading file contents', {repeat: 10}, function (done) {
        fs.readFile('benchmark.js', 'utf-8', function (err, data) {
            done();
        });
    });

    // same for async call - repeat the function several times to get average time of execution
    add ('reading file contents', {repeat: 10, average: true }, function (done) {
        fs.readFile('benchmark.js', 'utf-8', function (err, data) {
            done();
        });
    });

});