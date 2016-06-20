(function(){
  'use strict';
  
  var app = angular.module('bpk-knox-pro',[
    'bpk-home',
    'bpk-instagram',
    'bpk-bible',
    'bpk-common',
    'bpk-articles',
    'ngRoute'
  ]);
  
  app.config(makeSomeRoutes);
  
  makeSomeRoutes.$inject = ['$routeProvider', '$locationProvider'];
  function makeSomeRoutes($routeProvider, $locationProvider) {
    
    $locationProvider.html5Mode(true);
    
    $routeProvider.when('/', {
      controller: 'HomeController',
      contrllerAs: 'vm',
      templateUrl: 'assets/partials/home.html'
    });
    
    $routeProvider.when('/article/:id',{
      controller: 'ArticleController',
      controllerAs: 'vm',
      templateUrl: 'assets/partials/article.html'
    });
  }
  
})();
