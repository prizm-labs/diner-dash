/**
 * Created by michaelgarrido on 9/6/14.
 */

// Ensure that registered sessions are being create from browser window
// Prevent headless sessions...
visualClientStartup = function(){

    console.log('Client startup');

    // clear client id binding, so this client will receive global messages from server
    Meteor.ClientCall.setClientId( 'default' );

    registerViewportSize();

    // detect viewport size, to pass on to game world renderer
    $( window ).resize(function() {
        registerViewportSize();
    });

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


    // restore gameWorld from HCP
    if (Session.get('gameState_configuration')){
        createGameWorldFromConfiguration( Session.get('gameState_configuration') );
    }

};


registerViewportSize = function(){
    Session.set('viewport_width',$(window).width());
    Session.set('viewport_height',$(window).height());

    // if private client, resize UI hit area to fill screen
    if (Session.get('client_type')=='private'){
        console.log('resizing hit area');
        $('#hit-area').css({
            'width': $(window).width(),
            'height': $(window).height()
        })
    }
};