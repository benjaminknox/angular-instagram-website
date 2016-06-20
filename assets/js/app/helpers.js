'use strict';
var helpers = {
  coerceData: function(dest, src) {
    _.each(_.keys(dest), function(prop) {
      delete dest[prop];
    });

    _.assign(dest, src);

    return dest;
  }
};
