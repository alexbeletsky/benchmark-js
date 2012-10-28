module.exports = (function () {

    var _ = require('./chain');
    var context = { functions: [] };

    function createStrategySync(options) {
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
    }

    function syncWrap (actionName, options, func) {
        return _.wrap(func, function(f, next) {
            var strategy = createStrategySync(options);
            
            strategy(actionName, f);

            next();
        });
    }

    function asyncWrap(actionName, options, func) {
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
    }

    function add (actionName, options, func) {
        if (typeof(actionName) === 'function') {
            func = actionName;
            actionName = 'function call';
        } else if (typeof(options) === 'function') {
            func = options;
        }

        options = options || {};
        var wrap = func.length === 0 ? syncWrap(actionName, options, func) : asyncWrap(actionName, options, func);

        context.functions.push(wrap);
    }

    function benchmark (title, prepareContext) {
        prepareContext();
        _.chain(context.functions);
    }

    return {
        benchmark: benchmark,
        add: add
    };

})();
