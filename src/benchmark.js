module.exports = (function () {

    var _ = require('underscore');
    var context = { functions: [] };

    // TODO: move it to separate file
    _.mixin({
        chain: function(functions) {

            var current = 0;
            var next = function () {
                var func = functions[current++];
                if (func) {
                    func(next);
                }
            };

            next();
        }
    });

    function syncWrap (actionName, options, func) {
        return _.wrap(func, function(f, next) {
            var start = new Date().getTime();
            f();
            var finish = new Date().getTime();
            var duration = finish - start;

            console.log (actionName + ' took: ' + duration + ' msec.');

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
