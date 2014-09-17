/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function() {

    Deps.autorun(function(){

        if (Session.get('client_type')){

            if (Session.get('client_type')==='private') {
                bindPrivateClientMethods();
            } else if (Session.get('client_type')==='public') {
                bindPublicClientMethods();
            }

        }

    });

});

Meteor.methods({
    'clientReadyForGameSession': function( clientId, arenaId ){
        console.log('client stub: clientReadyForGameSession');

        // Bind stream for real-time data
        setTimeout(function() {
            Meteor.call('requestGameStream', Session.get('client_id'), Session.get('gameState_id'),
                function (error, result) {
                    console.log('client requestGameStream', error, result);

                    //bindGameStream(Session.get('gameState_id'));

                    gameWorld.liveData.setupStream(Session.get('gameState_id'));
                    gameWorld.liveData.activateStream(Session.get('gameState_id'));

                    gameWorld.liveData.addTrigger('test',function(data){
                        console.log('stream test', data);

                    });

                });
        },0);

        //gameWorld.call('setupDefaultWorld');
    }
})


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

        // TODO bind current user to player in game state

        // Cache game config data for hot code reload
        Session.set('gameState_configuration',args);
        Session.set('gameState_id',args.gameStateId);


        createGameWorldFromConfiguration( args );

    }

});

createGameWorldFromConfiguration = function( config ){

    // TODO Subscribe to gameState document, shared with all clients
    //connectionStore = subscriptions.activate.gameState(config.gameStateId);

    if (!gameWorld.preloaded){
        gameWorld.prepare( config.contexts[Session.get('client_type')] );
    }

    // Once gameState received from server
    // update gameWorld accordingly

    // if a client disconnects
    // pause game

    // if all clients reconnected
    // allow resume game clock

    // TODO define DDP bindings for gameWorld
    // TODO define stream bindings for gameWorld

    //

//    connectionStore = Meteor.connection.registerStore('nodes', {
//     beginUpdate: function( batchSize, reset ){
//     //console.log('beginUpdate nodes', batchSize, reset);
//     },
//     update: function( msg ){
//     //console.log('update nodes', JSON.stringify(msg));
//     //liveDataDelegate.updateSubscriptions( msg );
//     },
//     endUpdate: function(){
//     //console.log('endUpdate nodes');
//     },
//     saveOriginals: function(){
//     //console.log('saveOriginals');
//     },
//     retrieveOriginals: function(){
//     //console.log('retrieveOriginals');
//     }
//     });

}