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
            Meteor.call( 'registerClient', clientId, connectionId );
            Meteor.ClientCall.setClientId( clientId );

            // If private client, auto login user
            var user = Session.get('user');
            if ( user && clientType == 'private' ) {
                console.log('activating user',user);
                Meteor.call('activateUser', user._id, clientId, connectionId );
            }
        }

    },

    'onLogin': function( args ) {
        console.log('onLogin client', args);

        var connectionId = args[0], user = args[1], clientId = Session.get('client_id');

        if ( Meteor.connection._lastSessionId == connectionId ){
            console.log('onLogin paired connection id',Meteor.connection._lastSessionId);

            Session.set('user',user);
            console.log('active user',Session.get('user'));

            Meteor.call('activateUser', user._id, clientId, connectionId );
        }
    }

});