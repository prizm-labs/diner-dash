/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function() {


});


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
                Meteor.call('setViewerForClient', clientId, user._id );

                if (user.lobby_id){
                    subscriptions.activate.lobby(user.lobby_id);
                }

                if (user.arena_id){
                    //Session.set
                }
//                Meteor.call('activateUser', user._id, clientId, connectionId, function( error, result ){
//                    console.log('user after activateUser',result);
//                    Session.set('user',result);
//                });
//
//                if (user.lobby_id){
//                    Meteor.call('userEnterLobby',Session.get('user')._id,this._id, function( error, result ){
//                        console.log('user after enterLobby',result);
//                        Session.set('user',result);
//                    });
//                }
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




    }

});