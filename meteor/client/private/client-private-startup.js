/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function() {

    console.log('Client startup');
    Meteor.ClientCall.setClientId( 'default' );


    if (!Session.get('client_id')) {
        Session.set('client_id',Meteor.uuid());
        console.log('new client id');
    }

    console.log('client id', Session.get('client_id'));

    Deps.autorun(function(){

        console.log('connection status',Meteor.status());
        //Meteor.startup();



        if (Meteor.status().connected){

            console.log('requesting registration');
            Meteor.call('requestRegistration',Meteor.connection._lastSessionId);
//
//            var connectionId = Meteor.connection._lastSessionId;
//
//            if (connectionId){
//
//                console.log('connection id available',connectionId );
//
//                // update connection id for session with this client id
//                Meteor.call('registerClientAndConnection',Session.get('client_id'),connectionId);
//
//                Meteor.ClientCall.setClientId( Session.get('client_id') );
//            }
//
////            Session.set('clientId',Meteor.default_connection._lastSessionId);
////            console.log('new session connection', Session.get('clientId'));
//
        }

        // failed

        // waiting

        // offline
    });
//    console.log('current user',Meteor.user());



//
//    connectionStore = Meteor.connection.registerStore('meteor-clientCall-channel', {
//        beginUpdate: function( batchSize, reset ){
//
//            console.log('beginUpdate lobby', batchSize, reset);
//        },
//        update: function( msg ){
//            console.log('update lobby', JSON.stringify(msg));
//            //liveDataDelegate.updateSubscriptions( msg );
//        },
//        endUpdate: function(){
//            //console.log('endUpdate nodes');
//        },
//        saveOriginals: function(){
//            //console.log('saveOriginals');
//        },
//        retrieveOriginals: function(){
//            //console.log('retrieveOriginals');
//        }
//    });

    // DO


//    Meteor.loginWithFacebook({
//        requestPermissions: ['publish_actions']
//    }, function (err) {
//        if (err) {
//            Session.set('errorMessage', err.reason || 'Unknown error');
//        }
//    });
});

Meteor.ClientCall.methods({

    // if server onConnection executes before client status().connected updated
    'onConnect': function(args){
        console.log('onConnect client', args[0], Meteor.connection._lastSessionId);
        var connectionId = args[0];


        if (Meteor.connection._lastSessionId == connectionId){

            console.log('matching connection id!!!', connectionId);

            //Meteor.ClientCall.setClientId( Meteor.default_connection._lastSessionId );
            Meteor.call('registerClientAndConnection',Session.get('client_id'),connectionId);
            Meteor.ClientCall.setClientId( Session.get('client_id') );
        }

    },

    'onLogin': function( args ) {
        console.log('onLogin client', args);

        Meteor.logout();

        if (Meteor.connection._lastSessionId == args[0]){
            console.log('matching connection id!!!',Meteor.connection._lastSessionId);

            Session.set('user',args[1]);
            console.log('active user',Session.get('user'));
        }
    }

});


Template.private.rendered = function() {


//    if (Session.get('clientId')==null){
//        console.log('no session connection');

//        Deps.autorun(function() {
//            Session.set('clientId',Meteor.connection._lastSessionId);
//            console.log('new session connection', Session.get('clientId'))
//            Meteor.ClientCall.setClientId( Meteor.connection._lastSessionId );
//        });
//    }



    if (Meteor.user()){

        //Meteor.logout();

    }

//    Meteor.loginWithFacebook({
//        requestPermissions: ['publish_actions']
//    }, function (err) {
//        if (err) {
//            Session.set('errorMessage', err.reason || 'Unknown error');
//        }
//    });


};