var app = angular.module('mealtrack', [
    'ionic',
    'ngMessages',
    'ngCordova',
    'angularMoment',
    'firebase',
    'parse-angular',
    'parse-angular.enhance',
    'mealtrack.controllers.authentication',
    'mealtrack.controllers.intro',
    'mealtrack.controllers.meals',
    'mealtrack.controllers.account',
    'mealtrack.services.authentication',
    'mealtrack.services.userService',
    'mealtrack.services.meals',
    'mealtrack.filters.mealtime'
]);

app.constant("FIREBASE_URL", 'https://carcare.firebaseio.com/');
app.constant("FACEBOOK_APP_ID", '1698214307129548');

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleBlackTranslucent();
        }
    });

    // Initialise Parse
    //Parse.initialize("<PLEASE-INSERT>", "<PLEASE-INSERT>");
});

app.config(function ($stateProvider, $urlRouterProvider, FACEBOOK_APP_ID) {
    openFB.init({appId: FACEBOOK_APP_ID});
});

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
        	url: "/login",
        	cache: false,
        	controller: 'LoginCtrl',
        	templateUrl: "templates/login.html"
        })
        .state('signup', {
        	url: "/signup",
        	cache: false,
        	controller: 'SignupCtrl',
        	templateUrl: "templates/signup.html"
        })
        //.state('intro', {
        //    url: '/intro',
        //    templateUrl: 'templates/intro.html',
        //    controller: 'IntroCtrl'
        //})
        .state('tab', {
            url: "/tab",
            abstract: true,
            clearHistory: true,
            controller: 'MainCtrl',
            templateUrl: "templates/tabs.html"
        })
        .state('tab.track', {
            url: "/track",
            cache: false,
             views: {
                 'tab-track': {
                     templateUrl: 'tabs/tab-track.html',
                     controller: 'MealCreateCtrl'
                 }
            }
        })
        .state('tab.account', {
            url: "/account",
            views: {
                'tab-account': {
                    templateUrl: 'tabs/tab-account.html',
                    controller: 'MealListCtrl'
                }
            }
        })
        .state('tab.rides', {
			url: "/rides",
            cache: false,
			 views: {
                 'tab-meals': {
                     templateUrl: 'tabs/tab-meals.html',
                     controller: 'MealListCtrl'
                 }
            }
		})
        //TODO
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});

app.factory('$localstorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}]);

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
