(function(){
  'use strict';
  
  var app = angular.module('bpk-bible', []),
      helpers = {
        coerceData: function(dest, src) {
          _.each(_.keys(dest), function(prop) {
            delete dest[prop];
          });

          _.assign(dest, src);

          return dest;
        }
      };

  app.controller('DailyVerseController', DailyVerseController);
  app.provider('DailyVerse', DailyVerse);
  
  DailyVerseController.$inject = ['DailyVerse'];
  function DailyVerseController(DailyVerse) {
    var vm = this;
    
    vm.verse = DailyVerse.verse;
    
    
    activate();
    
    
    function activate() {
      DailyVerse.getVerse();
    }
  }
  
  function DailyVerse() {
    this.$get = $get;
    
    $get.$inject = ['$http', '$q', '$sce'];
    function $get($http, $q, $sce) {
      return {
        verse: {},
        getVerse: function() {
          var deferred = $q.defer(),
              self = this;
          $http.get('http://knox.pro:5555/api/v1/bible/daily_verse')
            .then(function(response) {
              helpers.coerceData(self.verse, {
                html: response
                        .data.html
                        .replace(/h2/g, 'h1')
                        .replace('href="http://www.esv.org"',
                                 'href="http://www.esv.org" target="_blank"')
              });
              self.verse.html = $sce.trustAsHtml(self.verse.html);
              deferred.resolve(self.verse);
            })
            .catch(function(response) {
              deferred.reject(response);
            });
          return deferred.promise;
        }
      };
    }
  }
})();