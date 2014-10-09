//angularMeteor.module('ionicApp', ['ionic'])

var app = angular.module('publicApp',['angular-meteor'])

// bind a Meteor reactive computation to the current scope
.factory('autorun', function() {
  return function(scope, fn) {
    // wrapping around Deps.autorun
    var comp = Deps.autorun(function(c) {
      fn(c);
      
      // this is run immediately for the first call
      // but after that, we need to $apply to start Angular digest
      if (!c.firstRun) setTimeout(function() {
        // wrap $apply in setTimeout to avoid conflict with
        // other digest cycles
        scope.$apply();
      }, 0);
    });
 
    // stop autorun when scope is destroyed
    scope.$on('$destroy', function() {
      comp.stop();
    });
 
    // return autorun object so that it can be stopped manually
    return comp;
  };
});

    Meteor.startup(function () {
      angular.bootstrap(document, ['publicApp']);
    });

    app.config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('public', {
                url: "/public",
                abstract: true,
                templateUrl: "templates/public"
            })
            .state('public.home', {
                url: "/home",
                views: {
                    'home-public': {
                        templateUrl: "templates/public/home",
                        controller: 'ArenaHomeCtrl'
                    }
                }
            })
            .state('public.lobby', {
                url: "/lobby",
                views: {
                    'home-public': {
                        templateUrl: "templates/public/lobby",
                        controller: 'LobbyController'
                    }
                }
            })
            .state('public.game', {
                url: "/game",
                views: {
                    'home-public': {
                        templateUrl: "game-world"
                    }
                }
            })

            .state('private', {
                url: "/private",
                abstract: true,
                templateUrl: "templates/private"
            })
            .state('private.home', {
                url: "/home",
                views: {
                    'home-private': {
                        controller: 'PlayerHomeCtrl',
                        templateUrl: "templates/private/home"
                    }
                }           
            })
            .state('private.lobby', {
                url: "/lobby",
                views: {
                    'home-private': {
                        templateUrl: "templates/private/lobby",
                        controller: 'LobbyController'
                    }
                }
            })

        $urlRouterProvider.otherwise("/private/home");
        //$urlRouterProvider.otherwise("/public/home");

    });

    app.controller('PlayerHomeCtrl', ['$scope', '$ionicModal', '$collection', 'autorun', 
        function($scope, $ionicModal, $collection, $autorun) {

        visualClientStartup();



        $scope.data = {
            user: null,
            lobby: null,
            arena: null
        };

        if (Session.get('user')){
            console.log('auto login user');
            $scope.data.user = Session.get('user');

            if (Session.get('lobby')){
                console.log('auto user enter lobby');

                Meteor.call('userEnterLobby',Session.get('user')._id,Session.get('lobby')._id, function( error, result ){
                    console.log('user after enterLobby',result);
                    if (result) Session.set('user',result);
                });


                subscriptions.activate.lobby(Session.get('lobby')._id);
                $scope.data.lobby = Session.get('lobby')._id;
            }
            
            if (Session.get('arena')){
                console.log('auto user enter arena');

                Meteor.call('userEnterArena', Session.get('user')._id,Session.get('arena')._id, function( error, result ){
                    console.log('user after userEnterArena',result);
                    if (result) {
                        Session.set('user',result);
                    }
                });

                $scope.data.arena = Session.get('arena')._id;
            }
        }        

        


        // Bind Collections
        $collection(Lobbies).bind($scope, 'lobbies');
        $collection(Arenas).bind($scope, 'arenas',true);

        $scope.selectLobby = function(lobby) {
            console.log('selectLobby',lobby);
            
            Meteor.call('userEnterLobby',Session.get('user')._id,lobby._id, function( error, result ){
                console.log('user after enterLobby',result);
                if (result) Session.set('user',result);
            });

            subscriptions.activate.lobby(lobby._id);
            Session.set('lobby',lobby);
        };

        $scope.selectArena = function(arena) {
            console.log('selectArena',arena);
            //Session.set('arena',arena);

             Meteor.call('userEnterArena', Session.get('user')._id,arena._id, function( error, result ){
                console.log('user after userEnterArena',result);
                if (result) {
                    Session.set('user',result);
                    Session.set('arena',arena);
                }
            });
        };

        // Login Modal
        $ionicModal.fromTemplateUrl('login',function(modal) {
            
            $scope.modal = modal;

            // Dind auto close modal on login
            $autorun($scope, function() {

                var user = Session.get('user');
                if (user) {
                    console.log('on login',user);
                    $scope.data.user = user;
                    $scope.modal.hide();
                }

            });

        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        // //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });

        $scope.loginWithFacebook = function(){
            Meteor.loginWithFacebook({
              requestPermissions: ['email']
            }, function (err) {
              if (err)
                Session.set('errorMessage', err.reason || 'Unknown error');
            });
        }

        $scope.loginWithGoogle = function(){
            Meteor.loginWithGoogle({
              requestPermissions: ['email']
            }, function (err) {
              if (err)
                Session.set('errorMessage', err.reason || 'Unknown error');
            });
        }

        $scope.logout = function(){
             Meteor.call('deactivateUser',Session.get('user')._id);
            Session.set('user',null);
            $scope.data.user=null;
        };

        

    }]);

    app.controller('ArenaHomeCtrl', ['$scope', '$ionicModal', '$collection', function($scope, $ionicModal, $collection) {
        //angularMeteor.controller('ArenaHomeCtrl', ['$scope', '$ionicModal', function($scope, $ionicModal) {
        console.log('ArenaHomeCtrl');


        visualClientStartup();


        $scope.data = {
            lobby: null,
            arena: null
        };

        if (Session.get('lobby')){
            console.log('auto subscribe to lobby');
            subscriptions.activate.lobby(Session.get('lobby')._id);
            $scope.data.lobby = Session.get('lobby')._id;
        }
        if (Session.get('arena')){
            console.log('auto link client to arena');
            Meteor.call('requestArenaRegistration',Session.get('client_id'),Session.get('arena')._id);
            $scope.data.arena = Session.get('arena')._id;
        }


        // Bind Collections
        $collection(Lobbies).bind($scope, 'lobbies');
        $collection(Arenas).bind($scope, 'arenas',true);
        

        $scope.selectArena = function(arena) {
            console.log('selectArena',arena);
            //Session.set('arena',arena);

             Meteor.call('requestArenaRegistration',Session.get('client_id'),arena._id,function(error,result){
                console.log('after requestArenaRegistration',result);
                if (result) Session.set('arena',result);
            });
        };

        $scope.selectLobby = function(lobby) {
            console.log('selectLobby',lobby);
            
            subscriptions.activate.lobby(lobby._id);
            Session.set('lobby',lobby);
        };

      //   $ionicModal.fromTemplateUrl('new-task', function (modal) {
      //   $scope.taskModal = modal;
      // }, {
      //   scope: $scope,
      //   animation: 'slide-in-up'
      // });

      // $scope.openModal = function() {
      //   $scope.taskModal.show();
      // };
      // $scope.closeModal = function() {
      //   $scope.taskModal.hide();
      // };


    }])

    .controller('LobbyController', ['$scope', '$collection', function($scope, $collection) {

        $collection(Meteor.users).bind($scope, 'users');



        // Users
        // $scope.users = [
        //     { "_id" : "ovfCEye2dTchodHW3", "active" : true, "arena_id" : null, "avatarNeedsResolution" : false, "client_id" : "e78c66ad-9ad2-4363-aaac-5c562bc1bec4", "createdAt" : Date("2014-10-03T05:48:45.864Z"), "lobby_id" : "n92EDr4ZwnNBKFRxD", "profile" : { "nickname": "spiritbomb","name" : "Michael Garrido", "gender" : "male", "avatar" : "https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg", "email" : "michael.a.garrido@gmail.com" }, "readyToPlay" : false, "services" : { "google" : { "accessToken" : "ya29.lQAzdm7kzT-_--F_4rWY5RjNpDiI3VSvzPiOfIj3v-PqXIxoAa-BLx-a", "email" : "michael.a.garrido@gmail.com", "expiresAt" : 1412491407392, "family_name" : "Garrido", "gender" : "male", "given_name" : "Michael", "id" : "111503527176171252250", "locale" : "en", "name" : "Michael Garrido", "picture" : "https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg", "verified_email" : true }, "resume" : { "loginTokens" : [ ] } } },
        //     { "_id" : "p9Xu6DHTLcucdbjPC", "active" : false, "arena_id" : null, "avatarNeedsResolution" : false, "client_id" : null, "createdAt" : Date("2014-10-03T05:50:14.066Z"), "lobby_id" : null, "profile" : { "nickname": "kamehameha","name" : "Michael Garrido", "gender" : null, "avatar" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", "email" : "michael@playprizm.com" }, "readyToPlay" : false, "services" : { "google" : { "accessToken" : "ya29.lAAWwOQPsW6ICQXdkxxc00Ed3H4lV6jCjWSbacDs7Bg-Lx-E3UTNctQt", "email" : "michael@playprizm.com", "expiresAt" : 1412397025903, "family_name" : "Garrido", "given_name" : "Michael", "id" : "108240569453813495178", "locale" : "en", "name" : "Michael Garrido", "picture" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", "verified_email" : true }, "resume" : { "loginTokens" : [ ] } } }
        // ];


    
    }]);