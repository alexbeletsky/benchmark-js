module.exports = (function () {

    var _ = require('./chain');
    var context = { functions: [] };

    var benchmark = {
        initialize: function () {
            _.bindAll(this);
        },

        createStrategySync: function (options) {
            if (options.repeat && options.average) {
                return average;
            }

            if (options.repeat) {
                return repeat;
            }

            return simple;
            
            function repeat(actionName, f) {
                var start = new Date().getTime();
                var message = actionName + ' (repeated ' + options.repeat + ' times) took: ';
                var seconds = ' msec.';

                for (var i = 0; i < options.repeat; i++) {
                    f();
                }

                var finish = new Date().getTime();
                var duration = finish - start;

                console.log (message + duration + seconds);
            }

            function average(actionName, f) {
                var start = new Date().getTime();
                var message = actionName + ' (repeated ' + options.repeat + ' times) took: ';
                var seconds = ' msec. (in average)';

                for (var i = 0; i < options.repeat; i++) {
                    f();
                }

                var finish = new Date().getTime();
                var duration = (finish - start) / options.repeat;

                console.log (message + duration + seconds);
            }

            function simple(actionName, f) {
                var start = new Date().getTime();
                var message = actionName + ' took: ';
                var seconds = ' msec.';

                f();

                var finish = new Date().getTime();
                var duration = finish - start;

                console.log (message + duration + seconds);
            }
        },

        syncWrap: function syncWrap (actionName, options, func) {
            var me = this;

            return _.wrap(func, function(f, next) {
                var strategy = me.createStrategySync(options);
                
                strategy(actionName, f);

                next();
            });
        },

        asyncWrap: function asyncWrap(actionName, options, func) {
            return _.wrap(func, function (f, next) {
                var start = new Date().getTime();

                var callback = function () {
                    var finish = new Date().getTime();
                    var duration = finish - start;

                    console.log (actionName + ' took: ' + duration + ' msec.');

                    next();
                };

                f(callback);
            });
        },

        establishContext: function (title, callback) {
            if (callback) {
                callback();

                _.chain(context.functions);
            }
        },

        addBenchmark: function (actionName, options, func) {
            if (typeof(actionName) === 'function') {
                func = actionName;
                actionName = 'function call';
            } else if (typeof(options) === 'function') {
                func = options;
            }

            options = options || {};
            var wrap = func.length === 0 ? this.syncWrap(actionName, options, func) : this.asyncWrap(actionName, options, func);

            context.functions.push(wrap);
        }

    };

    benchmark.initialize();

    return {
        benchmark: benchmark.establishContext,
        add: benchmark.addBenchmark
    };

})();
