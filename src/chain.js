var _ = require('underscore');

module.exports = (function () {
    
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

    return _;

})();