'use strict';

angular.module('Simpleweek.controllers')

  .controller('AuthController', function ($scope, $stateParams, $state, $ionicHistory, $ionicPopup, $timeout, $ionicContentBanner, swLoading, AuthService, ServerValidator) {
    $scope.BAD_REQUEST = 400;
    $scope.user = {};
    $scope.errorMessages = {};
    $scope.loginError = 'Username or password is incorrect';
    var contentBannerCloseCallback;

    /**
     * Log in user
     * @param loginForm
     */
    $scope.authenticateUser = function (loginForm) {
      var success = function () {
        swLoading.hide();
        $ionicHistory.nextViewOptions({disableBack: true});

        $state.go('app.tasks');
      };

      var error = function(errorResponse) {
        swLoading.hide();
        if (errorResponse.code && $scope.BAD_REQUEST === errorResponse.code && 'invalid_grant' === errorResponse.error.error) {
          contentBannerCloseCallback = $ionicContentBanner.show({
            type: 'error',
            text: [$scope.loginError],
            showCloseButton: false
          });
          loginForm.password.$setValidity('server', false);
        }
      };

      swLoading.show();
      contentBannerCloseCallback && contentBannerCloseCallback();

      AuthService.login($scope.user).then(success, error);
    };

    /**
     * Register a new user
     * @param registrationForm
     */
    $scope.registerUser = function (registrationForm) {
      if (registrationForm.$dirty || registrationForm.$valid) {
        var success = function() {
          swLoading.hide();
          $scope.authenticateUser();
        };

        var error = function(errorResponse) {
          swLoading.hide();

          if (errorResponse.code && $scope.BAD_REQUEST === errorResponse.code) {
            var errors = [
              ServerValidator.validateField('username', $scope, registrationForm, errorResponse),
              ServerValidator.validateField('email', $scope, registrationForm, errorResponse),
              ServerValidator.validateField('plainPassword', $scope, registrationForm, errorResponse, 'password'),
            ];

            var isError = function (value) {
              return !!value;
            }

            contentBannerCloseCallback = $ionicContentBanner.show({
              type: 'error',
              text: errors.filter(isError),
              showCloseButton: false
            });

          }
        };

        contentBannerCloseCallback && contentBannerCloseCallback();
        swLoading.show();

        AuthService.register($scope.user).then(success, error);
      } else {
        // form is invalid
      }
    };
  });
