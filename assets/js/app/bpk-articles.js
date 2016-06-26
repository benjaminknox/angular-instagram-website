(function(){
  'use strict';
  
  var app = angular.module('bpk-articles', ['angularMoment', 'ngDropdowns']);
  
  app.controller('ArticlesController', ArticlesController);
  app.controller('CategoriesController', CategoriesController);
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
    vm.loadMore = loadMore;
    vm.params = Articles.params;


    activate();


    function activate() {
      if(vm.params.page === 1) {
        Articles.load(true);
      }
    }

    function initCard() {
      $scope.$evalAsync(function() {
        $(window).trigger('articles-loaded');
      });
    }
    
    function loadMore() {
      vm.params.page += 1;
      Articles.load();
    }
  }
  
  CategoriesController.$inject = ['$location', '$scope', '$routeParams', 'Articles'];
  function CategoriesController($location, $scope, $routeParams, Articles) {
    var vm = this;
    
    vm.loadCategory = loadCategory;
    
    vm.articles = [];
    vm.category = $routeParams.category;
    vm.categories = [];
    vm.selectedCategory = {
      text: vm.category,
      value: vm.category
    };


    activate();


    function activate() {
      Articles.listByCategory(vm.category)
        .then(function(articles) {
          vm.articles = articles;
        });
        
      Articles.getCategories(vm.category).then(function(categories) {
        vm.categories.length = 0;
        Array.prototype.push.apply(
          vm.categories, 
          _.map(categories, function(category) {
            return {
              text: category,
              value: category
            }
          })
        );
      });
      
      $('body').addClass('category-wrapper');
      
      $scope.$on("$destroy", function() {
        $('body').removeClass('category-wrapper');
      });
    }
    
    function loadCategory(category) {
      $location.path('/articles/category/' + category.text)
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
        categories: [],
        params: {
          pageSize: 4,
          page: 1
        },
        reset : function() {
          this.records.length = 0;
          helpers.coerceData(this.record, {});
          helpers.coerceData(this.params, { pageSize: 4, page: 1 });
        },
        load: function(reset, params) {
          var deferred = $q.defer(),
              self = this;
              
          if(reset) {
            this.reset();
          }
              
          $http({
            method: 'GET',
            url: 'http://knox.pro:5555/api/v1/articles', 
            params: _.assign(this.params, params)
          })
          .then(function(response) {
            Array.prototype.push.apply(self.records, response.data.records);
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
                helpers.coerceData(self.record, response.data.record);
                self.records.push(self.record);
                deferred.resolve(self.record); 
              })
              .catch(function(response) {
                deferred.reject(response);
              });
          }
          return deferred.promise;
        },
        listByCategory: function(category, params) {
          var deferred = $q.defer(),
              self = this;
              
          $http.get('http://knox.pro:5555/api/v1/articles/category/' + category)
            .then(function(response) {
              // self.reset();
              // Array.prototype.push.apply(self.records, response.data);
              response.data.records.totalCount = response.data.count;

              deferred.resolve(response.data.records); 
            })
            .catch(function(response) {
              deferred.reject(response);
            });
          return deferred.promise;
        },
        getCategories: function() {
          var deferred = $q.defer(),
              self = this;
              
          $http.get('http://knox.pro:5555/api/v1/articles/categories/')
            .then(function(response) {
              Array.prototype.push.apply(self.categories, response.data.records);
              deferred.resolve(self.categories); 
            })
            .catch(function(response) {
              deferred.reject(response);
            });
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
      var introLength;
      
      if(article.body) {
        introLength = article.body.indexOf('<!--more-->');
        if(introLength !== -1) {
          ctrl.intro = article.body.substr(0, introLength);
        } else {
          ctrl.intro = article.body;
        }
        ctrl.intro = $sce.trustAsHtml(ctrl.intro);
      }
    }
  }
})();