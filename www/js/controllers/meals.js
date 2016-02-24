var app = angular.module('mealtrack.controllers.meals', []);


app.controller('MainCtrl', function ($scope, FIREBASE_URL, $firebaseArray, $localstorage) {
    var userRef = new Firebase(FIREBASE_URL + "/users");
    var user = userRef.child($localstorage.get('tvchat-user'));
    $scope.user = $firebaseArray(user);

    $scope.tabTitle = 'Account';
    $scope.TabUri = 'tab.account';

    $scope.user.$loaded().then(function () {
        console.log($scope.user);
        if ($localstorage.get('tvchat-user').substring(0, 8) === 'facebook') {
            $scope.currentUserData = {
                'name': $scope.user[1].$value,
                'profilePic': $scope.user[2].$value,
                'rank': $scope.user[3].$value
            };
            $scope.loadRides();

            if ($scope.currentUserData.rank === "admin") {
                $scope.tabTitle = 'AdminPanel';
                $scope.TabUri = 'tab.account';
            } else if ($scope.currentUserData.rank === "user") {
                $scope.tabTitle = 'Account';
                $scope.TabUri = 'tab.account';
            }

        } else {
            $scope.currentUserData = {
                'name': $scope.user[2].$value,
                'profilePic': $scope.user[3].$value,
                'rank': $scope.user[4].$value
            };
            $scope.loadRides();


            if ($scope.currentUserData.rank === "admin") {
                $scope.tabTitle = 'AdminPanel';
                $scope.TabUri = 'tab.account';
            } else if ($scope.currentUserData.rank === "user") {
                $scope.tabTitle = 'Account';
                $scope.TabUri = 'tab.account';
            }
        }
    });
});


/*********************************************************************
 * MealListCtrl
 *********************************************************************/
app.controller('MealListCtrl', function ($scope,
                                         $ionicLoading,
                                         $firebaseArray,
                                         FIREBASE_URL,
                                         $localstorage,
                                         MealService,
                                         UserService,
                                         //$ionicScrollDelegate,
                                         $state) {

    $scope.meals = MealService;

    var dataRef = new Firebase(FIREBASE_URL + "/users/" + $localstorage.get('tvchat-user'));
    var userRef = new Firebase(FIREBASE_URL + "/users");

    console.log($localstorage.get('tvchat-user').substring(0, 8));
    //$ionicLoading.show();

    $scope.data = {
        'Rides': [],
        'users': []
    };
    $scope.totalCount = '0';
    var user = userRef.child($localstorage.get('tvchat-user'));

    $scope.user = $firebaseArray(user);


    $scope.user.$loaded().then(function () {
        if ($localstorage.get('tvchat-user').substring(0, 8) === 'facebook') {
            $scope.currentUserData = {
                'name': $scope.user[1].$value,
                'profilePic': $scope.user[2].$value,
                'rank': $scope.user[3].$value
            };
            $scope.loadRides();
        } else {
            $scope.currentUserData = {
                'name': $scope.user[2].$value,
                'profilePic': $scope.user[3].$value,
                'rank': $scope.user[4].$value
            };
            $scope.loadRides();
        }
    });

    $scope.counterFunc = function () {
        var counter = 0;
        console.log("counterFunc init");
        for (var i = 0; i < $scope.data.Rides.length; i++) {
            counter += parseInt($scope.data.Rides[i].distance);
            console.log($scope.data.Rides[i].distance);
        }
        $scope.totalCount = counter.toLocaleString();
    };

    $scope.loadRides = function () {
        var query = dataRef
            .child("Rides")
            .limitToLast(100);
        $scope.$broadcast('scroll.refreshComplete');
        $scope.data.Rides = $firebaseArray(query);
        $scope.data.Rides.$loaded().then(function (data) {
            console.log($scope.data.Rides);
            $scope.counterFunc();
        });
        $ionicLoading.hide();
        console.log($scope.currentUserData.rank);
        //$ionicScrollDelegate.$getByHandle('rides-page').scrollBottom(true);
        if ($scope.currentUserData.rank === "user") {
            $scope.tabTitle = 'Account';
            $scope.TabUri = 'tab.account';
        } else {
            $scope.tabTitle = 'AdminPanel';
            $scope.TabUri = 'tab.account';
            var queryAdmin = userRef;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.data.users = $firebaseArray(queryAdmin);
            $scope.data.users.Rides = [];
            $scope.data.users.$loaded().then(function (data) {
                console.log(data);
                for (var i = 0; i < data.length; i++) {
                    console.log($scope.data.users);
                    for (var key in $scope.data.users[i].Rides) {
                        console.log($scope.data.users[i].name);
                        $scope.data.users.Rides.push({
                            'name': $scope.data.users[i].name,
                            'pic': $scope.data.users[i].profilePic,
                            'Rides': $scope.data.users[i].Rides[key]
                        });
                        console.log($scope.data.users.Rides);
                    }
                }
                // $scope.data.users.$loaded().then(function (data) {
                //console.log(data);
                //for (var i = 0; i < $scope.data.users.length; i++) {
                //    console.log($scope.data.users);
                //    for (var key in $scope.data.users[i].Rides) {
                //        console.log($scope.data.users[i].name);
                //        $scope.data.users.Rides.push({
                //            'name': $scope.data.users[i].name,
                //            'pic': $scope.data.users[i].profilePic,
                //            'Rides': $scope.data.users[i].Rides[key]
                //        });
                //        console.log($scope.data.users.Rides);
                //    }
                //}
                //$scope.counterFunc();
            });
            $ionicLoading.hide();
            //$ionicScrollDelegate.$getByHandle('rides-page').scrollBottom(true);
        }
    };

    $scope.meals.load().then(function () {
        $ionicLoading.hide();
    });

    $scope.refreshItems = function () {
        //$scope.meals.refresh().then(function () {
        //	$scope.$broadcast('scroll.refreshComplete');
        //});
        $scope.loadRides();
    };

    $scope.nextPage = function () {
        $scope.meals.next().then(function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.logout = function () {
        UserService.logoutUser();
        console.log("Logout");
        $scope.data.Rides = [];
        $state.go('login');
    };

});

/*********************************************************************
 * MealCreateCtrl
 *********************************************************************/
app.controller('MealCreateCtrl', function ($scope,
                                           $state,
                                           $firebaseArray,
                                           $localstorage,
                                           FIREBASE_URL,
                                           UserService,
                                           $ionicPopup,
                                           $ionicLoading,
                                           $cordovaCamera,
                                           MealService) {

    $scope.resetFormData = function () {
        $scope.formData = {
            'title': '',
            'category': '',
            'calories': 29,
            'picture': null
        };
    };
    $scope.resetFormData();

    var dataRef = new Firebase(FIREBASE_URL + "/users/" + $localstorage.get('tvchat-user'));
    var query = dataRef
        .child("Rides");

    $scope.data = {
        'Rides': []
    };

    $scope.data.Rides = $firebaseArray(query);

    $scope.trackMeal = function (form) {
        console.log("MealCreateCtrl::trackMeal");
        if (form.$valid) {
            $scope.data.Rides.$add({
                desc: $scope.formData.title,
                distance: $scope.formData.calories,
                //month: $scope.formData.category,
                timestamp: new Date().getTime()
            });
            $state.go('tab.rides');
            $scope.resetFormData();
        }
    };

    $scope.logout = function () {
        UserService.logoutUser();
        console.log("Logout");
        $state.go('login');
        $scope.data.Rides = [];
    };

    $scope.addPicture = function () {
        //var options = {
        //	quality: 50,
        //	destinationType: Camera.DestinationType.DATA_URL,
        //	sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        //	allowEdit: true,
        //	encodingType: Camera.EncodingType.JPEG,
        //	targetWidth: 480,
        //	popoverOptions: CameraPopoverOptions,
        //	saveToPhotoAlbum: false
        //};


        //TODO


    };

});