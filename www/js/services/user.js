var app = angular.module('mealtrack.services.userService', []);


app.service('UserService', function (FIREBASE_URL,
                                     $q,
                                     $state,
                                     $firebaseAuth,
                                     $firebaseObject,
                                     $rootScope,
                                     $localstorage,
                                     $ionicPopup) {

    var ref = new Firebase(FIREBASE_URL);
    var usersRef = new Firebase(FIREBASE_URL + "/users");

    var self = {
        /* This contains the currently logged in user */
        current: {},

        /*
         Makes sure the favorites property is preset on the current user.

         firebase REMOVES any empty properties on a save. So we can't
         bootstrap the user object with favorites: {}.
         */
        ensureFavorite: function () {
            if (!self.current.favorites) {
                self.current.favorites = {};
            }
        },

        /*
         If adds or removes a show from the users favorites list
         */
        toggleFavorite: function (show) {
            // Toggles the favorite setting for a show for the current user.
            self.ensureFavorite();
            if (self.current.favorites[show.showid]) {
                self.removeFavorite(show)
            } else {
                self.addFavorite(show)
            }
            self.current.$save();
        },
        /*
         Adds a show to the users favorites shows list
         */
        addFavorite: function (show) {
            self.ensureFavorite();
            self.current.favorites[show.showid] = show;
        },
        /*
         Removes a show from the users favorites shows list
         */
        removeFavorite: function (show) {
            self.ensureFavorite();
            self.current.favorites[show.showid] = null;
        },
        /*
         Checks to see if a user has already logged in in a previous session
         by checking localstorage, if so then loads that user up from firebase.
         */
        loadUser: function () {
            var d = $q.defer();
            console.log("Load User");

            // UNCOMMENT WHEN GOING THROUGH LECTURES

            // Check local storage to see if there is a user already logged in
            var currentUserId = $localstorage.get('tvchat-user', null);
            if (currentUserId && currentUserId != "null") {
                // If there is a logged in user then load up the object via firebase
                // and use $firebaseObject to keep it in sync between our
                // application and firebase.
                console.debug("Found previously logged in user, loading from firebase ", currentUserId);
                var user = $firebaseObject(usersRef.child(currentUserId));
                user.$loaded(function () {
                    // When we are sure the object has been completely
                    // loaded from firebase then resolve the promise.
                    self.current = user;
                    d.resolve(self.current);
                    $state.go('tab.rides');
                    console.debug("resolve Loaded ", currentUserId);
                });
            } else {
                console.debug("resolve Failed ", currentUserId);
                d.resolve();
            }
            console.debug("resolve Out ", currentUserId);
            d.resolve();
            return d.promise;
        },
        /*
         Logout the user
         */
        logoutUser: function () {
            $localstorage.set('tvchat-user', null);
            self.current = {};
        },
        registerUser: function (name, email, password) {
            var d = $q.defer();
            ref.createUser({
                name: name,
                email: email,
                password: password
            }, function (error, userData) {
                if (error) {
                    console.log("Error creating user:", error);
                    $ionicPopup.alert({
                        'title': 'Error',
                        'template': error
                    });
                    d.reject();
                } else {
                    console.log("Successfully created user account with uid:", userData.uid);
                    self.current = {
                        'name': name,
                        'email': email,
                        'profilePic': '',
                        'userId': userData.uid,
                        'rank': 'user',
                        'Rides': ''
                    };
                    $localstorage.set('tvchat-user', userData.uid);
                    console.log(userData);
                    usersRef.child(userData.uid)
                        .transaction(function (currentUserData) {
                            if (currentUserData === null) {
                                //
                                // If the transaction is a success and the current user data is
                                // null then this is the first time firebase has seen this user id
                                // so this user is NEW.
                                //
                                // Any object we return from here will be used as the user data
                                // in firebase
                                //
                                return {
                                    'name': name,
                                    'email': email,
                                    'profilePic': '',
                                    'userId': userData.uid,
                                    'rank': 'user',
                                    'Rides': ''
                                };
                            }
                        },
                        function (error, committed) {
                            //
                            // This second function in the transaction clause is always called
                            // whether the user was created or is being retrieved.
                            //
                            // We want to store the userid in localstorage as well as load the user
                            // and store it in the self.current property.
                            //
                            self.current = $firebaseObject(usersRef.child(userData.uid));
                            self.current.$loaded(function () {
                                // When we are sure the object has been completely
                                // loaded from firebase then resolve the promise.
                                d.resolve(self.current);
                            });
                        });
                    d.resolve(self.current);
                }
            });
            return d.promise;
        },
        /*
         Login the user with email and password
         */
        loginWithPassword: function (email, password) {
            var d = $q.defer();
            ref.authWithPassword({
                email: email,
                password: password
            }, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                    $ionicPopup.alert({
                        'title': 'Error',
                        'template': 'unknown username or password'
                    });
                    d.reject();
                } else {
                    console.log("Authenticated successfully with payload:", authData);
                    $localstorage.set('tvchat-user', authData.uid);
                    self.current = $firebaseObject(usersRef.child(authData.uid));
                    self.current.$loaded(function () {
                        // When we are sure the object has been completely
                        // loaded from firebase then resolve the promise.
                        d.resolve(self.current);
                    });
                }
            });
            return d.promise;
        },
        /*
         Login the user
         */
        loginUser: function () {
            var d = $q.defer();

            self.loadUser().then(function (user) {
                console.log(user);
                if (user) {
                    d.resolve(self.current);
                }
                else {

                    //
                    // Initiate the facebook login process
                    //
                    console.log('Calling facebook login');
                    openFB.login(
                        function (response) {
                            console.log(response);
                            if (response.status === 'connected') {
                                console.log('Facebook login succeeded');
                                //
                                // Facebook login was a success, get details about the current
                                // user
                                //
                                // UNCOMMENT WHEN GOING THROUGH LECTURES

                                var token = response.authResponse.accessToken;
                                openFB.api({
                                    path: '/me',
                                    params: {},
                                    success: function (userData) {
                                        console.log('Got data from facebook about current user');
                                        console.log(userData);


                                        //
                                        // We got details of the current user now authenticate via firebase
                                        //
                                        console.log('Authenticating with firebase');
                                        var auth = $firebaseAuth(ref);
                                        auth.$authWithOAuthToken("facebook", token)
                                            .then(function (authData) {
                                                console.log("Authentication success, logged in as:", authData.uid);
                                                console.log(authData);
                                                //
                                                // We've authenticated, now it's time to either get an existing user
                                                // object or create a new one.
                                                //

                                                usersRef.child(authData.uid)
                                                    .transaction(function (currentUserData) {
                                                        if (currentUserData === null) {
                                                            //
                                                            // If the transaction is a success and the current user data is
                                                            // null then this is the first time firebase has seen this user id
                                                            // so this user is NEW.
                                                            //
                                                            // Any object we return from here will be used as the user data
                                                            // in firebase
                                                            //
                                                            return {
                                                                'name': userData.name,
                                                                'profilePic': 'http://graph.facebook.com/' + userData.id + '/picture',
                                                                'userId': userData.id,
                                                                'rank': 'user',
                                                                'Rides': ''
                                                            };
                                                        }
                                                    },
                                                    function (error, committed) {
                                                        //
                                                        // This second function in the transaction clause is always called
                                                        // whether the user was created or is being retrieved.
                                                        //
                                                        // We want to store the userid in localstorage as well as load the user
                                                        // and store it in the self.current property.
                                                        //
                                                        $localstorage.set('tvchat-user', authData.uid);
                                                        self.current = $firebaseObject(usersRef.child(authData.uid));
                                                        self.current.$loaded(function () {
                                                            // When we are sure the object has been completely
                                                            // loaded from firebase then resolve the promise.
                                                            d.resolve(self.current);
                                                        });
                                                    });

                                            })
                                            .catch(function (error) {
                                                console.error("Authentication failed:", error);
                                                //
                                                // We've failed to authenticate, show the user an error message.
                                                //
                                                $ionicPopup.alert({
                                                    title: "Error",
                                                    template: 'There was an error logging you in with facebook, please try later.'
                                                });
                                                d.reject(error);
                                            });
                                    },
                                    error: function (error) {
                                        console.error('Facebook error: ' + error.error_description);
                                        //
                                        // There was an error calling the facebook api to get details about the
                                        // current user. Show the user an error message
                                        //
                                        $ionicPopup.alert({
                                            title: "Facebook Error",
                                            template: error.error_description
                                        });
                                        d.reject(error);
                                    }
                                });

                            } else {
                                console.error('Facebook login failed');
                                //
                                // There was an error authenticating with facebook
                                // Show the user an error message
                                //
                                $ionicPopup.alert({
                                    title: "Facebook Error",
                                    template: 'Failed to login with facebook'
                                });
                                d.reject(error);
                            }
                        },
                        {
                            scope: 'email' // Comma separated list of permissions to request from facebook
                        });
                }
            }, function (reason) {
                console.debug("resolve error", reason.message);
                console.error(reason.message);
            });
            console.debug("Loading Finished");
            return d.promise;
        }
    };

    self.loadUser();

    return self;
})
;
