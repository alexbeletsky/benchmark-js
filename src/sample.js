var _ = require('underscore');
var fs = require('fs');

var benchmark = require('./benchmark').benchmark;
var add = require('./benchmark').add;

benchmark('benchmark examples', function () {
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

    // // limit a call, if actual benchmark is higher - test will fail
    // add ('mapping some records', { limit: 100 }, function () {
    //     var count = 0;
    //     _.each(_.range(1000000), function () {
    //         count++;
    //     });
    // });

});