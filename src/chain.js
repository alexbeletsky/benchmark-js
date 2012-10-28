var _ = require('underscore');

module.exports = (function () {
    
    _.mixin({
        chain: function(functions, callback) {
            var current = 0;
            var next = function () {
                var func = functions[current++];
                if (func) {
                    return func(next);
                }

                callback && callback();
            };

            next();
        }
    });

    return _;

})();