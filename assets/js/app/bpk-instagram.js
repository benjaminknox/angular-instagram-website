(function(){
  'use strict';
  
  var app = angular.module('bpk-instagram', []),
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
  app.controller('InstagramController', InstagramController);
  app.provider('DailyVerse', DailyVerse);
  app.provider('InstagramPosts', InstagramPosts);
  app.component('thumbnails', {
    bindings: {
      posts: '<'
    },
    controllerAs: 'ctrl',
    controller: thumbnailsComponent,
    template: [
      '<div ng-repeat="column in ctrl.columns">', 
        '<a ng-repeat="post in column" href="{{ post.images.standard_resolution.url }}">',
          '<img src="{{ post.images.low_resolution.url }}" alt="{{ post.caption.text }}" />',
          '<h3>{{ post.caption.text }}</h3>',
        '</a>',
      '</div>'
    ].join(' '),
    transclude: true
  });
  
  
  DailyVerseController.$inject = ['DailyVerse'];
  function DailyVerseController(DailyVerse) {
    var vm = this;
    
    vm.verse = DailyVerse.verse;
    
    
    activate();
    
    
    function activate() {
      DailyVerse.getVerse();
    }
  }
  
  InstagramController.$inject = ['InstagramPosts'];
  function InstagramController(InstagramPosts) {
    var vm = this;
    
    vm.posts = InstagramPosts.posts;
    
    activate();
    
    
    function activate() {
      InstagramPosts.load().then(function(posts) {
        vm.posts = posts;
      });
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
          $http.jsonp('http://dailyverses.net/getdailyverse.ashx?language=nlt&callback=JSON_CALLBACK')
            .then(function(response) {
              helpers.coerceData(self.verse, response.data);
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

  function InstagramPosts(){
    this.$get = $get;
    
    $get.$inject = ['$http', '$httpParamSerializer', '$q'];
    function $get($http, $httpParamSerializer, $q) {
      return {
        page: 0,
        pageSize: 8,
        posts: [],
        post: {},
        reset: function(){
          this.post = {};
          this.posts = [];
          this.page = 0;
          this.pageSize = 8;
        },
        load: function(){
          var deferred = $q.defer(),
              endpoint = 'http://knox.pro:5555/api/v1/instagram',
              params = $httpParamSerializer({
                pageSize: this.pageSize
              }),
              self = this;
          
          $http.get(endpoint + '?' + params)
            .then(function(response){
              self.posts = response.data;
              deferred.resolve(self.posts);
            }).catch(function(response){
              deferred.reject(response);
            });
          
          return deferred.promise;
        }
      };
    }
  }

  thumbnailsComponent.$inject = ['InstagramPosts'];
  function thumbnailsComponent(InstagramPosts) {
    var ctrl = this;
    
    ctrl.$onChanges = function(changes) {
      updateColumns(changes.posts.currentValue);
    }
    
    function updateColumns(posts) {
      var count = 2,
          column = 0;
      
      ctrl.columns = [];
      _.each(posts, function(post, idx){
        if(!ctrl.columns[column]) {
          ctrl.columns[column] = [];
        }
        
        ctrl.columns[column].push(post);
        
        if(idx % count === 1) {
          column++;
        }
      });
    }
  }
})();