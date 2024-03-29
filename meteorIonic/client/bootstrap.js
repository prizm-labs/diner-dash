// Ensure that registered sessions are being create from browser window
// Prevent headless sessions...
visualClientStartup = function(){

    console.log('Client startup');

    // clear client id binding, so this client will receive global messages from server
    Meteor.ClientCall.setClientId( 'default' );

    // detect viewport size, to pass on to game world renderer
    registerViewportSize();

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

};

// setupForClientType = function(){
//     var clientType = Session.get('client_type');

//     if (clientType=='private') {
//         if (Session.get('user')){
//             console.log('auto login user');

//             if (Session.get('lobby')){
//                 console.log('auto user enter lobby');

//                 Meteor.call('userEnterLobby',Session.get('user')._id,Session.get('lobby')._id, function( error, result ){
//                     console.log('user after enterLobby',result);
//                     if (result) Session.set('user',result);
//                 });


//                 subscriptions.activate.lobby(Session.get('lobby')._id);
//             }

//             if (Session.get('arena')){
//                 console.log('auto user enter arena');

//                 Meteor.call('userEnterArena', Session.get('user')._id,Session.get('arena')._id, function( error, result ){
//                     console.log('user after userEnterArena',result);
//                     if (result) {
//                         Session.set('user',result);
//                     }
//                 });
//             }
//         }      


//     } else if (clientType=='public') {
//         if (Session.get('lobby')){
//             console.log('auto subscribe to lobby');
//             subscriptions.activate.lobby(Session.get('lobby')._id);
//         }
//         if (Session.get('arena')){
//             console.log('auto link client to arena');
//             Meteor.call('requestArenaRegistration',Session.get('client_id'),Session.get('arena')._id);
//         }
//     }
// }


registerViewportSize = function(){
    var height = window.screen.availHeight || window.screen.height;
    var width = window.screen.availWidth || window.screen.width;

    // 548, 460
    if (height==568&&width==320) {
        // iPhone5

    }

    // 460
    if (height==480&&width==320) {
        // iPhone4

    }

    Session.set('viewport_width',width);
    Session.set('viewport_height',height);

    // if private client, resize UI hit area to fill screen
    if (Session.get('client_type')=='private'){
        console.log('resizing hit area',width,height);
        $('#hit-area').css({
            'width': width,
            'height': height
        })
    }
};