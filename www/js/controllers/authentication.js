var app = angular.module('mealtrack.controllers.authentication', []);

/*********************************************************************
 * LoginCtrl
 *********************************************************************/
app.controller('LoginCtrl', function ($scope, $state, UserService) {

    $scope.formData = {
        "email": "",
        "password": ""
    };

    $scope.FBlogin = function () {
        console.log("LoginCtrl::login");
        UserService.loginUser().then(function () {
            console.debug("Login Finished");
            $scope.loggingIn = false;
            $state.go('tab.rides');
        }).catch(function (e) {
            console.log(e);
        });

    };

    $scope.login = function (form) {
        console.log("LoginCtrl::login");
        if (form.$valid) {
            UserService.loginWithPassword($scope.formData.email, $scope.formData.password).then(function () {
                console.debug("Login Finished");
                $scope.loggingIn = false;
                $state.go('tab.rides');
            }).catch(function (e) {
                console.log(e);
            });
        } else {
            console.log("Login::invalid");
        }
    };
});

/*********************************************************************
 * SignupCtrl
 *********************************************************************/
app.controller('SignupCtrl', function ($scope, $state, UserService) {

    $scope.formData = {
        "name": "",
        "email": "",
        "password": ""
    };

    $scope.signup = function (form) {
        console.log("SignupCtrl::signup");
        if (form.$valid) {
            UserService.registerUser($scope.formData.name, $scope.formData.email, $scope.formData.password).then(function () {
                console.debug("SignUp Finished");
                $scope.loggingIn = false;
                $state.go('tab.rides');
            }).catch(function (e) {
                console.log(e);
            });
        } else {
            console.log("Login::invalid");
        }
    };

});