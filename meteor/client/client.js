/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function() {


});


Meteor.ClientCall.methods({

    // if server onConnection executes before client status().connected updated
    'onConnect': function( args ){

        var connectionId = args[0];
        //console.log('onConnect client', connectionId, Meteor.connection._lastSessionId);

        if ( Meteor.connection._lastSessionId == connectionId ){
            console.log('onConnect paired connection id', connectionId);
            Meteor.call('registerClient',Session.get('client_id'),connectionId);
            Meteor.ClientCall.setClientId( Session.get('client_id') );
        }

    },

    'onLogin': function( args ) {
        console.log('onLogin client', args);

        var connectionId = args[0], user = args[1];

        if ( Meteor.connection._lastSessionId == connectionId ){
            console.log('onLogin paired connection id',Meteor.connection._lastSessionId);

            Session.set('user',user);
            console.log('active user',Session.get('user'));

            Meteor.call('activateUser',user._id,Session.get('client_id'),connectionId);
        }
    }

});

Template.public.rendered = function() {

    visualClientStartup();

   // Register new lobby



};


Template.private.rendered = function() {

    visualClientStartup();

    if (Session.get('user')) {

        console.log('active user !!!',Session.get('user'));

    }

};


// Ensure that registered sessions are being create from browser window
// Prevent headless sessions...

function visualClientStartup(){

    console.log('Client startup');

    // clear client id binding, so this client will receive global messages from server
    Meteor.ClientCall.setClientId( 'default' );


    // generate local client id for registration on server
    if (!Session.get('client_id')) {
        Session.set('client_id',Meteor.uuid());
        console.log('new client id');
    }
    console.log('client id', Session.get('client_id'));


    Deps.autorun(function(){

        if (Meteor.status().connected){

            console.log('connection open, requesting registration');
            Meteor.ClientCall.setClientId( 'default' );
            Meteor.call('requestClientRegistration',Meteor.connection._lastSessionId);
        }

        // failed

        // waiting

        // offline
    });

}