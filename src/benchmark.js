module.exports = (function () {

    var _ = require('./chain');

    var benchmark = {
        initialize: function () {
            _.bindAll(this);

            this.contexts = {};
        },

        sync: {
            createStrategy: function (options) {
                if (options.repeat && options.average) {
                    return average;
                }

                if (options.repeat) {
                    return repeat;
                }

                return simple;
                
                function repeat(actionName, f, next) {
                    var message = actionName + ' (repeated ' + options.repeat + ' times) took: ';
                    var seconds = ' msec.';

                    var start = new Date().getTime();
                    for (var i = 0; i < options.repeat; i++) {
                        f();
                    }

                    var finish = new Date().getTime();
                    var duration = finish - start;

                    console.log (message + duration + seconds);

                    next();
                }

                function average(actionName, f, next) {
                    var message = actionName + ' (repeated ' + options.repeat + ' times) took: ';
                    var seconds = ' msec. (in average)';

                    var start = new Date().getTime();
                    for (var i = 0; i < options.repeat; i++) {
                        f();
                    }

                    var finish = new Date().getTime();
                    var duration = (finish - start) / options.repeat;

                    console.log (message + duration + seconds);

                    next();
                }

                function simple(actionName, f, next) {
                    var message = actionName + ' took: ';
                    var seconds = ' msec.';

                    var start = new Date().getTime();
                    f();
                    var finish = new Date().getTime();
                    var duration = finish - start;

                    console.log (message + duration + seconds);

                    next();
                }
            },

            wrap: function syncWrap (actionName, options, func) {
                var me = this;

                return _.wrap(func, function(f, next) {
                    var strategy = me.createStrategy(options);
                    strategy(actionName, f, next);
                });
            }
        },

        async: {
            createStrategy: function (options) {
                if (options.repeat && options.average) {
                    return average;
                }

                if (options.repeat) {
                    return repeat;
                }

                return simple;

                function repeat(actionName, f, next) {
                    var message = actionName + ' (repeated ' + options.repeat + ' times) took: ';
                    var seconds = ' msec.';

                    var chain = [];
                    for (var i = 0; i < options.repeat; i++) {
                        chain.push(f);
                    }

                    var start = new Date().getTime();
                    var callback = function () {
                        var finish = new Date().getTime();
                        var duration = finish - start;

                        console.log (message + duration + seconds);

                        next();
                    };

                    _.chain(chain, callback);
                }

                function average(actionName, f, next) {
                    var message = actionName + ' (repeated ' + options.repeat + ' times) took: ';
                    var seconds = ' msec. (in average)';

                    var chain = [];
                    for (var i = 0; i < options.repeat; i++) {
                        chain.push(f);
                    }

                    var start = new Date().getTime();
                    var callback = function () {
                        var finish = new Date().getTime();
                        var duration = (finish - start) / options.repeat;

                        console.log (message + duration + seconds);

                        next();
                    };

                    _.chain(chain, callback);
                }

                function simple (actionName, f, next) {
                    var start = new Date().getTime();

                    var callback = function () {
                        var finish = new Date().getTime();
                        var duration = finish - start;

                        console.log (actionName + ' took: ' + duration + ' msec.');

                        next();
                    };

                    f(callback);
                }
            },

            wrap: function asyncWrap(actionName, options, func) {
                var me = this;

                return _.wrap(func, function (f, next) {
                    var strategy = me.createStrategy(options);
                    strategy(actionName, f, next);
                });
            }
        },

        establishContext: function (title, callback) {
            if (callback) {
                this.currentContext = { functions: [] };
                this.contexts[title] = this.currentContext;

                callback();

                _.chain(this.contexts[title].functions);
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
            var wrap = func.length === 0 ? this.sync.wrap(actionName, options, func) : this.async.wrap(actionName, options, func);

            this.currentContext.functions.push(wrap);
        }

    };

    benchmark.initialize();

    return {
        benchmark: benchmark.establishContext,
        add: benchmark.addBenchmark
    };

})();
