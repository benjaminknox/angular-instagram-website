(function(){
  'use strict';
  
  var app = angular.module('bpk-instagram', []);
  
  app.controller('InstagramController', InstagramController);
  app.provider('InstagramPosts', InstagramPosts);
  app.component('thumbnails', {
    bindings: {
      posts: '<'
    },
    controllerAs: 'ctrl',
    controller: thumbnailsComponent,
    template: [
      '<div ng-repeat="(index, column) in ctrl.columns" id="column-{{ index }}">', 
        '<a ng-repeat="post in column"',
           'repeat-end="ctrl.initPoptrox(index);"',
           'target="_blank"',
           'href="{{ post.images.standard_resolution.url }}">',
          '<img ng-src="{{ post.images.low_resolution.url }}" alt="{{ post.caption.text }}" />',
          '<h3 ng-bind-html="post.caption.text"></h3>',
        '</a>',
      '</div>'
    ].join(' '),
    transclude: true
  });
  
  
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

  thumbnailsComponent.$inject = ['InstagramPosts', '$sce', '$scope'];
  function thumbnailsComponent(InstagramPosts, $sce, $scope) {
    var ctrl = this;
    
    ctrl.initPoptrox = initPoptrox;
    
    ctrl.$onChanges = function(changes) {
      updateColumns(changes.posts.currentValue);
    }

    function addHandle(post) {
      post.caption.text = $sce.trustAsHtml(
        post.caption.text
          .replace(/@([\w\.]+)/g, [
            '<a href="http://www.instagram.com/$1"',
               'data-poptrox="ignore"',
               'class="handle"',
               'target="_blank">',
              '@$1',
            '</a>'
          ].join(' '))
      ); 
    }
    
    function initPoptrox(column) {
      // debugger
      if(ctrl.columns.length === column + 1) {
        $scope.$evalAsync(function() {
          $(window).trigger('thumbnails-loaded', column);
        });
      }
    }
    
    function updateColumns(posts) {
      var count = 2,
          column = 0;
      
      ctrl.columns = [];
      _.each(posts, function(post, idx){
        addHandle(post);
        
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