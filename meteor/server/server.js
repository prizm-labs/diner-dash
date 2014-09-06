/**
 * Created by michaelgarrido on 9/4/14.
 */
Sessions = new Meteor.Collection('sessions');

Meteor.methods({

    'registerClientAndConnection': function( clientId, connectionId ){

        console.log('setting clientId & connectionId', clientId, connectionId);

        Sessions.upsert( clientId ,{ '_id': clientId, 'connection': connectionId });

        console.log('registered sessions', Sessions.find().fetch());
    },

    'requestRegistration': function( connectionId ){

        console.log('requestRegistration', connectionId );
        Meteor.ClientCall.apply( 'default', 'onConnect', [ [connectionId] ],
            function(){ console.log('client called from server'); });
    }

})

Meteor.startup(function () {

    // https://github.com/arunoda/meteor-streams/issues/17
    Meteor.onConnection(function(connection) {
        console.log('server made connection',connection);

        var self = connection;

        Meteor.ClientCall.apply( 'default', 'onConnect', [ [connection.id] ],
            function(){ console.log('client called from server'); });

        connection.onClose(function(){

           console.log('connection closed !!!',self);

            //TODO delete session document with this connection id
            var session = Sessions.findOne({"connection":self.id});

            console.log('session matching closed connection', session);
            if (session) {
                Sessions.remove(session._id);
            }
        });

    });


    // refactor service configuration for production
    // http://stackoverflow.com/questions/17140483/how-do-i-reconfigure-meteors-accounts-facebook-or-where-is-meteors-facebook-c
    Accounts.loginServiceConfiguration.remove({
        service: "facebook"
    });

    Accounts.loginServiceConfiguration.insert({
        service: "facebook",
        appId: 697413780331229,
        secret: "ed58a86e0c972fef62b79e324e26a10d"
//        appId: process.env.FACEBOOK_APP_ID,
//        secret: process.env.FACEBOOK_APP_SECRET
    });

    Accounts.loginServiceConfiguration.remove({
        service: "google"
    });

    Accounts.loginServiceConfiguration.insert({
        "service": "google",
        "clientId" : "975952622795-gkl0du04pl1e24eij9tbn564uq5okhnk.apps.googleusercontent.com",
        "secret" : "Q0avgYdDrsReBemMZ7f8dmPG"
    });

    //
    //Q0avgYdDrsReBemMZ7f8dmPG
    //975952622795-gkl0du04pl1e24eij9tbn564uq5okhnk.apps.googleusercontent.com

    // GOAL: Enable multiple unique users signed in, each on separate window of same browser client

//    setInterval(function() {
//        //sendLogin(2,{a:1});
//        //sendChat('server yo',2);
//    }, 1000);

    //https://meteor.hackpad.com/Login-hooks-design-notes-o0809sK58jX
    //

    Accounts.validateLoginAttempt(function( request ){

        console.log('validateLoginAttempt',request);




        // check if user is active on a client

        // check if request type is "resume" auto login

        // otherwise valid types are: "facebook", "google", "password"
        if ( request.type==='facebook' || request.type==='google'){
            console.log('connection for login request',request.connection.id);

            // Find client id associated with request.connection.id
            var client = Sessions.findOne({"connection":request.connection.id});
            console.log('client matching connection for login request ',client);


            Meteor.ClientCall.apply( client._id, 'onLogin', [ [request.connection.id,request.user] ],
                function(){ console.log('client called from server'); });
//            Meteor.ClientCall.apply( 'default', 'onLogin', [ [request.connection.id,request.user] ],
//                function(){ console.log('client called from server'); });


            return true;

        } else if (request.type==='resume' ) {
            return false;
        } else {
            return false;
        }

//        if (request.type==='resume'){
//            return false;
//        } else {
//            return true;
//        }


    });

    Accounts.onLogin(function( request ){

       console.log('onLogin',request);
//        sendChat('onlogin yo',2);
//        sendLogin(request.connection.id,request.user);

       //services.google.picture

        //services.facebook
       //https://developers.facebook.com/docs/graph-api/reference/user/picture/


       //.email
        //.id
        //gender
        //name

    });

});