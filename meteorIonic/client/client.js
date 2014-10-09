/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function() {

    Deps.autorun(function(){

//        if (Session.get('client_type')){
//            bindGameWorldMethodsByClientType(Session.get('client_type'));
//        }

    });

});

//Meteor.methods({
//    'clientReadyForGameSession': function( clientId, arenaId ){
//        console.log('client stub: clientReadyForGameSession');
//
//
//        setTimeout(function() {
//            Meteor.call('requestGameStream', Session.get('client_id'), Session.get('gameState_id'),
//                function (error, result) {
//                    console.log('client requestGameStream', error, result);
//
//                    // Bind stream for real-time data
//                    gameWorld.liveData.setupStream(Session.get('gameState_id'));
//                    gameWorld.liveData.activateStream(Session.get('gameState_id'));
//
//                    bindStreams();
//
//                    // Transition to game scene from lobby
//                    $('#home-view').hide();
//                    $('#hit-area').show();
//                    gameWorld.call('setupDefaultWorld',Session.get('gameState_configuration'));
//
//                });
//        },0);
//    }
//});


Meteor.ClientCall.methods({

    // if server onConnection executes before client status().connected updated
    'onConnect': function( args ){

        var connectionId = args[0], clientId = Session.get('client_id'), clientType =  Session.get('client_type');
        //console.log('onConnect client', connectionId, Meteor.connection._lastSessionId);

        if ( Meteor.connection._lastSessionId == connectionId ){
            console.log( 'onConnect paired connection id', connectionId );
            Meteor.call( 'registerClient', clientId, connectionId, Session.get('client_type') );
            Meteor.ClientCall.setClientId( clientId );

            // If private client, auto login user
            var user = Session.get('user');
            if ( user && clientType == 'private' ) {

                console.log('auto set user',user);
                Meteor.call('setUser', user);
                Meteor.call('setViewerForClient', clientId, user._id, function(error,result){

                    // User has been linked with Session

                    if (user.lobby_id){
                        subscriptions.activate.lobby(user.lobby_id);
                    }

                    if (user.arena_id){
                        console.log('auto enter arena');
                        Meteor.call('userEnterArena',user._id,user.arena_id);
                    }
                });



            }
        }

    },

    'onLogin': function( args ) {
        console.log('onLogin client', args);

        var connectionId = args[0], user = args[1], clientId = Session.get('client_id');

        if ( Meteor.connection._lastSessionId == connectionId ){

            Meteor.logout();

            console.log('onLogin paired connection id',Meteor.connection._lastSessionId);

            Session.set('user',user);
            console.log('active user',Session.get('user'));

            Meteor.call('activateUser', user._id, clientId, connectionId, function( error, result ){
                console.log('user after activateUser',result);
                Session.set('user',result);
            });
        }
    },


    'onArenaReady': function( args ){

        console.log('onArenaReady', args);
        var config = args[0], playerIndex = args[1];

        // TODO bind current user to player in game state

        // Cache game config data for hot code reload
        Session.set('gameState_configuration',config);
        Session.set('gameState_id',config.gameStateId);

        if (Session.get('client_type')=='private'){
            Session.set('playerIndex',playerIndex);
        }

        createGameWorldFromConfiguration( config );


    },

    'onGameStart': function (args) {

        console.log('client onGameStart', args);

        // Bind stream for real-time data
        gameWorld.liveData.setupStream(Session.get('gameState_id'));
        gameWorld.liveData.activateStream(Session.get('gameState_id'));

        bindGameWorldMethodsByClientType(Session.get('client_type'));
        bindStreams();

        // Transition to game scene from loading screen
        // TODO teardown loading screen
        gameWorld.call('setupDefaultWorld',Session.get('gameState_configuration'));
    },

    'onResetGame': function(args){

        console.log('onResetGame',args);

        resetGameWorld();


        // TODO Receive new game state config
        //Session.set('gameState_configuration',config);
        //Session.set('gameState_id',config.gameStateId);

        //createGameWorldFromConfiguration( config );
        //gameWorld.call('setupDefaultWorld',Session.get('gameState_configuration'));

        return true;
    },

    'onReturnToLobby': function(args) {

        console.log('onReturnToLobby',args);

        resetGameWorld();

        transitionGameWorldToLobby();

        return true;
    }

});