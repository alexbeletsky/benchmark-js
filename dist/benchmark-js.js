/*! benchmark-js - v0.0.1 - 2012-11-29
* Copyright (c) 2012 ; Licensed  */

module.exports = (function () {

    var _ = require('./chain');

    var benchmark = {
        initialize: function () {
            _.bindAll(this);

            this.contexts = {};
        },

        // Sync functions benchmarking
        sync: {
            createStrategy: function (context, options) {
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
                        callFunction(f);
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
                        callFunction(f);
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
                    callFunction(f);
                    var finish = new Date().getTime();
                    var duration = finish - start;

                    console.log (message + duration + seconds);

                    next();
                }

                function callFunction(f) {
                    if (context.beforeEach) {
                        context.beforeEach();
                    }

                    f();

                    if (context.afterEach) {
                        context.afterEach();
                    }
                }
            },

            wrap: function syncWrap (actionName, context, options, func) {
                var me = this;

                return _.wrap(func, function(f, next) {
                    var strategy = me.createStrategy(context, options);
                    strategy(actionName, f, next);
                });
            }
        },

        // Async function benchmarking
        async: {
            createStrategy: function (context, options) {
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
                    var callback = function () {
                        var finish = new Date().getTime();
                        var duration = finish - start;

                        console.log (message + duration + seconds);

                        next();
                    };

                    var chain = [];
                    for (var i = 0; i < options.repeat; i++) {
                        chain.push(callFunction(f, callback));
                    }

                    _.chain(chain, callback);
                }

                function average(actionName, f, next) {
                    var message = actionName + ' (repeated ' + options.repeat + ' times) took: ';
                    var seconds = ' msec. (in average)';

                    var start = new Date().getTime();
                    var callback = function () {
                        var finish = new Date().getTime();
                        var duration = (finish - start) / options.repeat;

                        console.log (message + duration + seconds);

                        next();
                    };

                    var chain = [];
                    for (var i = 0; i < options.repeat; i++) {
                        chain.push(callFunction(f, callback));
                    }

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

                    callFunction(f, callback)();
                }

                function callFunction(f, callback) {
                    return function () {
                        if (context.beforeEach) {
                            context.beforeEach();
                        }

                        f(callback);

                        if (context.afterEach) {
                            context.afterEach();
                        }
                    };
                }

            },

            wrap: function asyncWrap(actionName, context, options, func) {
                var me = this;

                return _.wrap(func, function (f, next) {
                    var strategy = me.createStrategy(context, options);
                    strategy(actionName, f, next);
                });
            }
        },

        establishContext: function (title, callback) {
            if (callback) {
                this.currentContext = { functions: [] };
                this.contexts[title] = this.currentContext;

                // run all `add` functions to prepare context of testing..
                callback();

                // launch tests functions
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
            var wrap = func.length === 0 ? this.sync.wrap(actionName, this.currentContext, options, func) : this.async.wrap(actionName, this.currentContext, options, func);

            this.currentContext.functions.push(wrap);
        },

        beforeEach: function (callback) {
            this.currentContext.beforeEach = callback;
        },

        afterEach: function (callback) {
            this.currentContext.afterEach = callback;
        }

    };

    benchmark.initialize();

    return {
        benchmark: benchmark.establishContext,
        add: benchmark.addBenchmark,
        beforeEach: benchmark.beforeEach,
        afterEach: benchmark.afterEach
    };

})();
