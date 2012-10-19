module.exports = (function () {

    var _ = require('underscore');
    var context = { functions: [] };

    function syncWrap (actionName, func) {
        return _.wrap(func, function(func) {
            var start = new Date().getTime();
            func();
            var finish = new Date().getTime();
            var duration = finish - start;

            console.log (actionName + ' took: ' + duration + ' msec.');
        });
    }

    function asyncWrap(actionName, func) {
        return _.wrap(func, function (func) {
            var start = new Date().getTime();

            var callback = function () {
                var finish = new Date().getTime();
                var duration = finish - start;

                console.log (actionName + ' took: ' + duration + ' msec.');
            };

            func(callback);
        });
    }

    function add (actionName, func) {
        if (typeof(actionName) === 'function') {
            func = actionName;
            actionName = 'function call';
        }

        var wrap = func.length === 0 ? syncWrap(actionName, func) : asyncWrap(actionName, func);
        context.functions.push(wrap);
    }

    function benchmark (title, prepareContext) {
        prepareContext();

        _.each(context.functions, function(f) {
            f();
        });
    }

    return {
        benchmark: benchmark,
        add: add
    };

})();
