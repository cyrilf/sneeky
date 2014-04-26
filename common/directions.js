'use strict';

(function(exports) {
    /**************************************************
    ** DIRECTIONS
    **************************************************/
    var directions = {
        UP : 0,
        RIGHT : 1,
        DOWN : 2,
        LEFT : 3,

        inverse : function( d ) {
            if( d == this.UP )
                return this.DOWN;
            else if( d == this.RIGHT )
                return this.LEFT;
            else if( d == this.DOWN )
                return this.UP;
            else
                return this.RIGHT;
        }
    };
    exports.directions = directions;
})(typeof global === "undefined" ? window : exports);
