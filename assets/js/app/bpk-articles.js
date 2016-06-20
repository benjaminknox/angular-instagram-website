(function(){
  'use strict';
  
  var app = angular.module('bpk-articles', ['angularMoment']);
  
  app.controller('ArticlesController', ArticlesController);
  app.controller('ArticleController', ArticleController);
  app.provider('Articles', Articles);
  app.component('articleCard', {
    bindings: {
      article: '<'
    },
    controller: ArticleComponent,
    controllerAs: 'ctrl',
    templateUrl: 'assets/partials/article-card.html'
  });
  
  
  ArticlesController.$inject = ['Articles', '$scope'];
  function ArticlesController(Articles, $scope) {
    var vm = this;

    vm.articles = Articles.records;
    vm.initCard = initCard;


    activate();


    function activate() {
      Articles.load();
    }

    function initCard() {
      $scope.$evalAsync(function() {
        $(window).trigger('articles-loaded');
      });
    }
  }
  
  ArticleController.$inject = ['$scope', 'Articles', '$routeParams', '$sce'];
  function ArticleController($scope, Articles, $routeParams, $sce) {
    var vm = this;
    
    vm.article = Articles.record;
    
    activate();
    
    
    function activate() {
      Articles.find($routeParams.id).then(function(){
        vm.articleHtml = $sce.trustAsHtml(vm.article.body);
      });
      
      $('body').addClass('article');
      
      $scope.$on("$destroy", function() {
        $('body').removeClass('article');
      });
    }
  }
  
  function Articles() {
    this.$get = $get;
    
    $get.$inject = ['$http', '$q', '$sce'];
    function $get($http, $q, $sce) {
      return {
        pageSize: 4,
        record: {},
        records: [],
        reset : function() {
          helper.coerceData(this.record, {});
          this.records.length = 0;
          this.pageSize = 4;
        },
        load: function() {
          var deferred = $q.defer(),
              self = this;
              
          $http.get('http://knox.pro:5555/api/v1/articles')
            .then(function(response) {
              // Hacked until I get paging working
              self.records.length = 0;
              response.data.length = self.pageSize;
              Array.prototype.push.apply(self.records, response.data);
              deferred.resolve(self.records);
            })
            .catch(function(response) {
              deferred.reject(response);
            });

          return deferred.promise;
        },
        find: function(id) {
          var deferred = $q.defer(),
              record = _.find(this.records, {id: id}),
              self = this;

          if(record) {
            helpers.coerceData(self.record, record);
            deferred.resolve(self.record); 
          } else {
            $http.get('http://knox.pro:5555/api/v1/articles/' + id)
              .then(function(response) {
                helpers.coerceData(self.record, response.data);
                self.records.push(self.record);
                deferred.resolve(self.record); 
              })
              .catch(function(response) {
                deferred.reject(response);
              });
          }
          return deferred.promise;
        }
      };
    }
  }
    
  ArticleComponent.$inject = ['$sce', '$scope'];
  function ArticleComponent($sce, $scope) {
    var ctrl = this;
    
    ctrl.$onChanges = function(changes) {
      updateArticle(changes.article.currentValue);
    };
    
    function updateArticle(article) {
      var introLength = article.body.indexOf('<!--more-->');
      if(introLength !== -1) {
        ctrl.intro = article.body.substr(0, introLength);
      } else {
        ctrl.intro = article.body;
      }
      ctrl.intro = $sce.trustAsHtml(ctrl.intro);
    }
  }
})();