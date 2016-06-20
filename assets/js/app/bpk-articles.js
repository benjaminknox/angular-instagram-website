(function(){
  'use strict';
  
  var app = angular.module('bpk-articles', []);
  
  app.controller('ArticlesController', ArticlesController);
  app.provider('Articles', Articles);
  app.component('Article', {
    bindings: {
      article: '<'
    },
    controller: ArticleComponent,
    controllerAs: 'ctrl',
    template: [
      '<div></div>'
    ].join(' ')
  });
  
  ArticlesController.$inject = ['Articles'];
  function ArticlesController(Articles) {
    var vm = this;
    
    
    activate();
    
    
    function activate() {
      Articles.load().then(function(){
        Articles.find(6);
      });
    }
  }
  
  function Articles() {
    this.$get = $get;
    
    $get.$inject = ['$http', '$q', '$sce'];
    function $get($http, $q, $sce) {
      return {
        pageSize: 10,
        record: {},
        records: [],
        reset : function() {
          helper.coerceData(this.record, {});
          this.records.length = 0;
          this.pageSize = 10;
        },
        load: function() {
          var deferred = $q.defer(),
              self = this;
              
          $http.get('http://knox.pro:5555/api/v1/articles')
            .then(function(response) {
              // Hacked until I get paging working
              self.records.length = 0;
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
                helpers.coerceData(self.record, record);
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
})();