/*
 * @license
 * angularjs-validation v1.0.8
 * (c) 2015 Shawn Adrian <shawn@inputlogic.ca> http://inputlogic.ca
 * License: MIT
 */

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('angular'));
  } else {
    return factory(root.angular);
  }
}(this, function (angular) {

  var moduleName = 'validation';

  angular
    .module(moduleName, [])
    .factory('validationService', validationService);

  validationService.$inject = [
    '$http', 
    '$q', 
    '$rootScope', 
    '$state'
  ];

  function validationService($http, $q, $rootScope, $state) {
    var service = {};
    
    // HANDLE ERRORS
    service.handleErrors = function($scope, data) {
      var self = this; 
      
      // scroll to top
      $(window).scrollTop(0);
      
      // var for error messages
      $scope.errors = {};
      console.log('errors found: ', data);
      
      // set messages to error scope
      angular.forEach(data.errors, function(value, key) {
        if(value !== '') {
          $scope.form[key].$setValidity('app', false);
          console.log($scope.form[key]);
          console.log('setting ' + key + ' error message to: ' + value);
          $scope.errors[key] = value;
        }
      });
      
      return $scope;
      
    };
    
    return service;
  }

  /* SHAKE THAT */
  // directive to shake login on error
  angular.module(moduleName).directive('validationShake', ['$animate', function($animate) {
    
    return {
      require: '^form',
      scope: {
        submit: '&',
        submitted: '='
      },
      link: function(scope, element, attrs, form) {
        
        // listen on submit event
        element.on('submit', function(e) {
          
          console.log('just clicked submit');
                  
          // tell angular to update scope
          scope.$apply(function() {
            
            // everything ok -> call submit fn from controller
            if(form.$valid && !form.$pristine) {
              console.log('form is valid and not pristine');
              return scope.submit();
            }

            // show error messages on submit
            scope.submitted = true;
            
            // shake that form
            $animate.addClass(element, 'shake', function() {
              $animate.removeClass(element, 'shake');
            });
            
          });
        });
      }
    };

  }]);  

  /* MATCH */
  angular.module(moduleName).directive('validationMatch', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      scope: false,
      link: function(scope, elem, attrs, ngModel) {

        elem.on('keyup', function() {
          return compare(scope[attrs.appMatch], elem.val());
        });
              
        var compare = function(original, compare) {
          if(original !== compare)
            return ngModel.$setValidity('match', false);
          else
            return ngModel.$setValidity('match', true);
        }

      }
    };
  });

  /* ERRORS */
  angular.module(moduleName).directive('validationErrors', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        element.on('keydown', function() {
          return ngModel.$setValidity('app', true);
        });
      }
    };
  });  

  /* EMAIL VALIDATION */
  angular.module(moduleName).directive('validationEmail', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, elem, attrs, ngModel) {
        
        // on blur make sure it's a valid email
        elem.on('blur', function(){
          var value = $(this).val();
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if(!re.test(value)) {
            return ngModel.$setValidity('email', false);      
          } else {
            return ngModel.$setValidity('email', true);              
          }
        });    

      }
    };
  });  

  /* CLEAR */
  angular.module(moduleName).directive('validationClear', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, elem, attrs, form) {

        elem.on('focus', function() {
          if($(this).val() === 'placeholder') {
            $(this).val('');
          }
        });
        
        elem.on('blur', function(){
          if($(this).val() === '') {
            $(this).val('placeholder');
          }
        });

      }
    };
  });

  return moduleName;
}));