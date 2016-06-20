(function(){
  'use strict';
  
  var app = angular.module('bpk-home', []);
  
  
  app.controller('HomeController', HomeController);
  app.controller('LoadingController', LoadingController)
  
  LoadingController.$inject = ['$scope', '$timeout'];
  function LoadingController($scope, $timeout) {
    $scope.$on('$routeChangeStart', function() {
      $('body').addClass('is-loading');
    });
    
    $scope.$on('$routeChangeSuccess', stopLoading);
    $scope.$on('$routeChangeError', stopLoading);

    function stopLoading() {
      $timeout(function() {
        $('body').removeClass('is-loading');
      }, 2000);
    }
  } 
  
  
  HomeController.$inject = [];
  function HomeController() { }
  
})();