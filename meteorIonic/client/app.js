//angularMeteor.module('ionicApp', ['ionic'])

// http://stackoverflow.com/questions/10486769/cannot-get-to-rootscope
    var run = function($rootScope, $location, $state, $stateParams) {

        // register listener to watch route changes
        $rootScope.$on( "$stateChangeStart", function(event, target) {
          
          console.log('stateChangeStart',event, target);

            //console.log('$rootScope info',$rootScope, $location, $state, $stateParams);

            if (!$rootScope.clientType) {

                console.log('bootstrap by client type');

                // TODO bind client type here based on route
            var privateRoute = /^private/.test(target.name);
            var publicRoute = /^public/.test(target.name);
            var clientType;

                if (privateRoute) {
                    clientType = 'private';
                } else if (publicRoute) {
                    clientType = 'public';
                }

                $rootScope.clientType = clientType;
                Session.set('client_type', clientType);

                visualClientStartup();
            }
        });

        $rootScope.$on( "$stateChangeSuccess", function(event, target) {
          
          console.log('stateChangeSuccess',event, target);

          if (target.name=='public.game') {
            Meteor.call('setupArenaForGame', Session.get('arena')._id );
          }
        });
    };


    run.$inject = ['$rootScope','$location','$state', '$stateParams'];

    var config = function($stateProvider, $urlRouterProvider ) {

        // Deps.autorun(function(){
        //     console.log('reactive setup by client type');
        // });

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
                        controller: 'PublicHomeController'
                    }
                }
            })
            .state('public.lobby', {
                url: "/lobby",
                views: {
                    'home-public': {
                        templateUrl: "templates/public/lobby",
                        controller: 'PublicLobbyController'
                    }
                }
            })
            .state('public.game', {
                url: "/game",
                views: {
                    'home-public': {
                        templateUrl: "templates/public/game",
                        contoller: 'PublicGameController'
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
                        controller: 'PrivateHomeController',
                        templateUrl: "templates/private/home"
                    }
                }           
            })
            .state('private.lobby', {
                url: "/lobby",
                views: {
                    'home-private': {
                        templateUrl: "templates/private/lobby",
                        controller: 'PrivateLobbyController'
                    }
                }
            })
            .state('private.game', {
                url: "/game",
                views: {
                    'home-private': {
                        templateUrl: "templates/private/game",
                        contoller: 'PrivateGameController'
                    }
                }
            });

        $urlRouterProvider.otherwise("/private/home");
        //$urlRouterProvider.otherwise("/public/home");
    }

    config.$inject = ['$stateProvider','$urlRouterProvider'];

var app = angular.module('publicApp',['angular-meteor'])

// https://medium.com/@zfxuan/the-wonderful-duo-using-meteor-and-angularjs-together-4d603a4651bf
// bind a Meteor reactive computation to the current scope
.factory('autorun', function() {
  return function(scope, fn) {
    // wrapping around Deps.autorun
    var comp = Deps.autorun(function(c) {
        console.log('running computation',c);

      fn(c);
      
      // this is run immediately for the first call
      // but after that, we need to $apply to start Angular digest
      if (!c.firstRun) setTimeout(function() {
        // wrap $apply in setTimeout to avoid conflict with
        // other digest cycles
        if (scope) scope.$apply();
      }, 0);
    });
 
    // stop autorun when scope is destroyed
    scope.$on('$destroy', function() {
        console.log('stop computation',comp);
        comp.stop();
    });
 
    // return autorun object so that it can be stopped manually
    return comp;
  };
})

.config(config)

.run(run)

    .controller('PublicHomeController', ['$scope', '$rootScope', '$location', '$ionicModal', '$collection', 'autorun', 
        function($scope, $rootScope, $location, $ionicModal, $collection, $autorun) {

        // visualClientStartup();

        $scope.data = {
            user: Session.get('user') || null,
            lobby: Session.get('lobby') || null,
            arena: Session.get('arena') || null
        };

        // if (Session.get('user')){
        //     console.log('auto login user');
        //     $scope.data.user = Session.get('user');

        //     if (Session.get('lobby')){
        //         console.log('auto user enter lobby');
        //         $scope.data.lobby = Session.get('lobby')._id;
        //     }

        //     if (Session.get('arena')){
        //         console.log('auto user enter arena');
        //         $scope.data.arena = Session.get('arena')._id;
        //     }
        // }        

        


        // Bind Collections
        $collection(Lobbies).bind($scope, 'lobbies');
        $collection(Arenas).bind($scope, 'arenas',true);

        $scope.selectLobby = function(lobby) {
            console.log('selectLobby',lobby);

            subscriptions.activate.lobby(lobby._id);
            Session.set('lobby',lobby);
        };

        $scope.selectArena = function(arena) {
            console.log('selectArena',arena);
            Session.set('arena',arena);
        };

        $scope.enterLobby = function(){

            Meteor.call('userEnterLobby',Session.get('user')._id,$scope.data.lobby._id, 
                function( error, result ){
                console.log('user after enterLobby',result);
                if (result) Session.set('user',result);
            });

            Meteor.call('userEnterArena', Session.get('user')._id,$scope.data.arena._id, 
                function( error, result ){
                console.log('user after userEnterArena',result);
                if (result) Session.set('user',result);
                
            });

            $location.path('/private/lobby');

        };

        // Login Modal
        $ionicModal.fromTemplateUrl('login',function(modal) {
            
            $scope.modal = modal;

            // Dind auto close modal on login
            $autorun($scope, function() {
                console.log('updating user');
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
            Session.set('arena',null);
            Session.set('lobby',null);
            $scope.data.user=null;
            $scope.data.lobby=null;
            $scope.data.arena=null;
        };

    }])

    .controller('PrivateLobbyController', ['$scope', '$collection', '$location', 'autorun', function($scope, $collection, $location, $autorun) {
        console.log('PrivateLobbyController');

        $collection(Meteor.users).bind($scope, 'users');
        $collection(Arenas).bind($scope, 'arenas');
        $collection(Games).bind($scope, 'games');


            //     var connectionStore = Meteor.connection.registerStore('arenasInLobby', {
            //     beginUpdate: function( batchSize, reset ){
            //         console.log('beginUpdate arenas', batchSize, reset);
            //     },
            //     update: function( msg ){
            //         console.log('update arenas', JSON.stringify(msg));
            //         //liveDataDelegate.updateSubscriptions( msg );
            //     },
            //     endUpdate: function(){
            //         console.log('endUpdate arenas');
            //     }
            // });

        $scope.data = {
            user: Session.get('user') || null,
            lobby: Session.get('lobby') || null,
            arena: Session.get('arena') || null,
            selectedGame: Session.get('selectedGame') || null
        };

        $autorun($scope, function() {
            console.log('updating selected game');
                var game = Session.get('selectedGame');
                $scope.data.selectedGame = game;
            });

        $scope.setReadyToPlay = function(){
            Meteor.call('setPlayerReady',Session.get('user')._id, Session.get('arena')._id, 
                function(error,result){
                    console.log('user after setPlayerReady',result);
                    if (result) {
                        Session.set('user',result);

                        $scope.$apply(function(){
                            $location.path('/private/game');
                        })
                    }
                    // // Check if player's arena is ready
                    // Meteor.call('checkArenaReadyForGame', Session.get('arena')._id, function(error,result){
                    //     if (result) Meteor.call('setupArenaForGame', Session.get('arena')._id );
                    // });


                });
        }

        // Users
        // $scope.users = [
        //     { "_id" : "ovfCEye2dTchodHW3", "active" : true, "arena_id" : null, "avatarNeedsResolution" : false, "client_id" : "e78c66ad-9ad2-4363-aaac-5c562bc1bec4", "createdAt" : Date("2014-10-03T05:48:45.864Z"), "lobby_id" : "n92EDr4ZwnNBKFRxD", "profile" : { "nickname": "spiritbomb","name" : "Michael Garrido", "gender" : "male", "avatar" : "https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg", "email" : "michael.a.garrido@gmail.com" }, "readyToPlay" : false, "services" : { "google" : { "accessToken" : "ya29.lQAzdm7kzT-_--F_4rWY5RjNpDiI3VSvzPiOfIj3v-PqXIxoAa-BLx-a", "email" : "michael.a.garrido@gmail.com", "expiresAt" : 1412491407392, "family_name" : "Garrido", "gender" : "male", "given_name" : "Michael", "id" : "111503527176171252250", "locale" : "en", "name" : "Michael Garrido", "picture" : "https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg", "verified_email" : true }, "resume" : { "loginTokens" : [ ] } } },
        //     { "_id" : "p9Xu6DHTLcucdbjPC", "active" : false, "arena_id" : null, "avatarNeedsResolution" : false, "client_id" : null, "createdAt" : Date("2014-10-03T05:50:14.066Z"), "lobby_id" : null, "profile" : { "nickname": "kamehameha","name" : "Michael Garrido", "gender" : null, "avatar" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", "email" : "michael@playprizm.com" }, "readyToPlay" : false, "services" : { "google" : { "accessToken" : "ya29.lAAWwOQPsW6ICQXdkxxc00Ed3H4lV6jCjWSbacDs7Bg-Lx-E3UTNctQt", "email" : "michael@playprizm.com", "expiresAt" : 1412397025903, "family_name" : "Garrido", "given_name" : "Michael", "id" : "108240569453813495178", "locale" : "en", "name" : "Michael Garrido", "picture" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", "verified_email" : true }, "resume" : { "loginTokens" : [ ] } } }
        // ];


    
    }])

.controller('PrivateGameController', ['$scope', '$collection', '$location', 
    function($scope, $collection, $location) {
        console.log('PrivateGameController');

        $scope.data = {
            user: Session.get('user') || null
        };

        //Meteor.call('setupArenaForGame', Session.get('arena')._id );
        $scope.cancelReadyToPlay = function(){
            Meteor.call('cancelPlayerReady',Session.get('user')._id,
                function(error,result){
                    console.log('user after cancelPlayerReady',result);
                    if (result) {
                        Session.set('user',result);
                        $scope.$apply(function(){
                            $location.path('/private/lobby');
                        })
                    }
                });
        }
    }])


.controller('PublicHomeController', ['$scope', '$location', '$ionicModal', '$collection', function($scope, $location, $ionicModal, $collection) {
        //angularMeteor.controller('ArenaHomeCtrl', ['$scope', '$ionicModal', function($scope, $ionicModal) {
        console.log('PublicHomeController');

        $scope.data = {
            lobby: Session.get('lobby') || null,
            arena: Session.get('arena') || null
        };

        // Bind Collections
        $collection(Lobbies).bind($scope, 'lobbies');
        $collection(Arenas).bind($scope, 'arenas',true);
        

        $scope.selectArena = function(arena) {
            console.log('selectArena',arena);
            //Session.set('arena',arena);
        };

        $scope.selectLobby = function(lobby) {
            console.log('selectLobby',lobby);
            
            subscriptions.activate.lobby(lobby._id);
            Session.set('lobby',lobby);
        };

        $scope.enterLobby = function(){

            Meteor.call('requestArenaRegistration',Session.get('client_id'),$scope.data.arena._id,
                function(error,result){
                console.log('after requestArenaRegistration',result);
                if (result) {
                    // Proceed after arena confirmed
                    Session.set('arena',result);
                    $scope.$apply(function(){
                        $location.path('/public/lobby');
                    })
                    
                }
            });

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

    .controller('PublicLobbyController', ['$scope', '$collection', '$location', function($scope, $collection, $location) {
        console.log('PublicLobbyController');

        // Bind Collections
        $collection(Games).bind($scope, 'games');
        $collection(Meteor.users).bind($scope, 'users');


        $scope.data = {
            arena: Session.get('arena') || null,
            lobby: Session.get('lobby') || null,
            game: Session.get('game') || null
        }

        $scope.selectGame = function(game){
            Meteor.call('setArenaGame',Session.get('arena')._id, game._id, function(error,result){
                console.log('arena after set game',result);
                if (result) Session.set('arena',result);
            });
            Session.set('game',game);
            $scope.data.game = game;
        }
        // Users
        // $scope.users = [
        //     { "_id" : "ovfCEye2dTchodHW3", "active" : true, "arena_id" : null, "avatarNeedsResolution" : false, "client_id" : "e78c66ad-9ad2-4363-aaac-5c562bc1bec4", "createdAt" : Date("2014-10-03T05:48:45.864Z"), "lobby_id" : "n92EDr4ZwnNBKFRxD", "profile" : { "nickname": "spiritbomb","name" : "Michael Garrido", "gender" : "male", "avatar" : "https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg", "email" : "michael.a.garrido@gmail.com" }, "readyToPlay" : false, "services" : { "google" : { "accessToken" : "ya29.lQAzdm7kzT-_--F_4rWY5RjNpDiI3VSvzPiOfIj3v-PqXIxoAa-BLx-a", "email" : "michael.a.garrido@gmail.com", "expiresAt" : 1412491407392, "family_name" : "Garrido", "gender" : "male", "given_name" : "Michael", "id" : "111503527176171252250", "locale" : "en", "name" : "Michael Garrido", "picture" : "https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg", "verified_email" : true }, "resume" : { "loginTokens" : [ ] } } },
        //     { "_id" : "p9Xu6DHTLcucdbjPC", "active" : false, "arena_id" : null, "avatarNeedsResolution" : false, "client_id" : null, "createdAt" : Date("2014-10-03T05:50:14.066Z"), "lobby_id" : null, "profile" : { "nickname": "kamehameha","name" : "Michael Garrido", "gender" : null, "avatar" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", "email" : "michael@playprizm.com" }, "readyToPlay" : false, "services" : { "google" : { "accessToken" : "ya29.lAAWwOQPsW6ICQXdkxxc00Ed3H4lV6jCjWSbacDs7Bg-Lx-E3UTNctQt", "email" : "michael@playprizm.com", "expiresAt" : 1412397025903, "family_name" : "Garrido", "given_name" : "Michael", "id" : "108240569453813495178", "locale" : "en", "name" : "Michael Garrido", "picture" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", "verified_email" : true }, "resume" : { "loginTokens" : [ ] } } }
        // ];

        $scope.startGame = function(){

            // Check if player's arena is ready
            Meteor.call('checkArenaReadyForGame', Session.get('arena')._id, function(error,result){
                
                console.log('arena is ready?',result)
                if (result) {

                    //Load game world view
                    $scope.$apply(function(){
                        $location.path('/public/game');
                    })
                    
                    //Meteor.call('setupArenaForGame', Session.get('arena')._id );
                }
            });


        }

    
    }])
    
    .controller('PublicGameController', ['$scope', '$collection', '$location', function($scope, $collection, $location) {
        console.log('PublicGameController');

        //Meteor.call('setupArenaForGame', Session.get('arena')._id );
    }]);

    
    Meteor.startup(function () {
        //app.run(run);
        //$('body').html('<div ng-app="publicApp"><ion-nav-view animation="slide-left-right"></ion-nav-view></div>');
        angular.bootstrap(document, ['publicApp']);
    });
