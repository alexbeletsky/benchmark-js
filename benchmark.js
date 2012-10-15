var _ = require('underscore');

module.exports = (function () {
    var benchmarks = [];

    function _benchmarkSync(actionName, action, next) {
        var start = new Date().getTime();
        action();
        var finish = new Date().getTime();
        var duration = finish - start;

        console.log (actionName + ' took: ' + duration + ' msec.');

        if (next) {
            next();
        }
    }

    function _benchmarkAsync(actionName, action, next) {
        var start = new Date().getTime();

        var _callback = function () {
            var finish = new Date().getTime();
            var duration = finish - start;

            console.log (actionName + ' took: ' + duration + ' msec.');

            if (next) {
                next();
            }
        };

        action(_callback);
    }


    function _benchmark(benchmark, next) {
        if (benchmark.async) {
            return _benchmarkAsync(benchmark.name, benchmark.action, next);
        }

        return _benchmarkSync(benchmark.name, benchmark.action, next);
    }

    return {
        add: function (benchmarkName, func) {
            var name, action;
            if (typeof(benchmarkName) === 'function') {
                name = 'function';
                action = benchmarkName;
            } else if (typeof(benchmarkName) === 'string' && typeof(func) === 'function') {
                name = benchmarkName;
                action = func;
            }

            if (action.length === 0) {
                benchmarks.push({ name: name, action: action});
            } else {
                benchmarks.push({ name: name, action: action, async: true});
            }

            return this;
        },

        run: function () {
            this.currentBenchmark = 0;
            var next = _.bind(function () {
                var benchmark = benchmarks[this.currentBenchmark++];
                if (benchmark) {
                    _benchmark(benchmark, next);
                }
            }, this);

            next();
        }
    };

})();