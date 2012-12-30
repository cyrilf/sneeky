(function(exports) {
    /**************************************************
    ** DIRECTIONS
    **************************************************/
    var Directions = {
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
    exports.Directions = Directions;
})(typeof global === "undefined" ? window : exports);