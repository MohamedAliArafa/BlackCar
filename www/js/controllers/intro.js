var mod = angular.module('mealtrack.controllers.intro', []);

mod.controller('IntroCtrl', function ($scope, $state, UserService) {

	$scope.loggingIn = false;

	$scope.login = function () {
		if (!$scope.loggingIn) {
			$scope.loggingIn = true;
			UserService.loginUser().then(function () {
				console.debug("Login Finished");
				$scope.loggingIn = false;
			    $state.go('tab.rides');
		   });
		}
	}
});