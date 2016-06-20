(function(){
  'use strict';
  
  var app = angular.module('bpk-common', []);
  
  // Taken from: http://jsfiddle.net/jwcarroll/ZFp3a/
  app.directive('repeatEnd', repeatEnd);
  
  function repeatEnd() {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        if (scope.$last) {
          scope.$eval(attrs.repeatEnd);
        }
      }
    };
  }
})();