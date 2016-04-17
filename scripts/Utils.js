const Utils = (function(){
	const assert = function(condition, message) {
        if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message; // Fallback
        }
    }

	const assign = function(target) {
	    return Array.from(arguments).slice(1).reduce((previous, current) => {
	        for(var key in current)
	        	if(typeof current[key] !== 'undefined')
	           		previous[key] = current[key];
	        return previous;
	    },target);
	}

	return {
		assign: assign,
		assert: assert
	}
}());