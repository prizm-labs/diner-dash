/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.methods({

    'registerClient': function( clientId, connectionId ){

        console.log('setting clientId & connectionId', clientId, connectionId);

        Sessions.upsert( clientId ,{ '_id': clientId, 'connection': connectionId, 'type': null, 'viewer_id': null });

        console.log('registered sessions', Sessions.find().fetch());
    },

    'requestClientRegistration': function( connectionId ){

        console.log('requestRegistration', connectionId );
        Meteor.ClientCall.apply( 'default', 'onConnect', [ [connectionId] ],
            function(){ console.log('client called from server'); });
    },

    'activateUser': function( userId, clientId, connectionId ){

        var user = Meteor.users.findOne( userId );
        console.log('player to activate', user);

        if ( user ){
            // Update user document
            Meteor.users.update( userId, { $set: { active: true, client_id: clientId } } );

            // Bind active user to open session
            Sessions.update( { _id: clientId, connection: connectionId }, { $set: { type: 'private', viewer_id: userId } } );

            // TODO check error if no matched session

            // TODO Update lobby views with activated player
        }

    },

    'deactivateUser': function( playerId ){

        console.log('deactivate player bound to session',playerId);
        Meteor.users.update( playerId, { $set: { active: false, client_id: null } } );

    },

    'activateLobby': function(){


    },

    'registerPrivateClient': function( connectionId ){

        console.log('registerPrivateClient', connectionId);



    },

    'registerPublicClient': function( connectionId ){

        console.log('registerPublicClient', connectionId);



    }

});



function teardownSession( connection ){

    console.log('connection closed !!!',connection);

    var session = Sessions.findOne({"connection":connection.id});

    console.log('session matching closed connection', session);
    if (session) {

        var playerId = session.viewer_id, sessionType = session.type;

        // Delete session document with this connection id
        Sessions.remove(session._id);

        // Deactivate player bound to session
        if ( sessionType==='private' && playerId !== null ){

            Meteor.call('deactivateUser',playerId);
        }
    }

}


Meteor.startup(function () {

    // https://github.com/arunoda/meteor-streams/issues/17
    Meteor.onConnection(function(connection) {
        console.log('server made connection',connection);

        var self = connection;

        Meteor.ClientCall.apply( 'default', 'onConnect', [ [connection.id] ],
            function(){ console.log('client called from server'); });

        connection.onClose( function(){teardownSession(connection)});

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


    // GOAL: Enable multiple unique users signed in, each on separate window of same browser client
    //https://meteor.hackpad.com/Login-hooks-design-notes-o0809sK58jX


    // Bypassing Meteor user login to avoid setting reactive user object for all clients in the same browser
    Accounts.validateLoginAttempt(function( request ){

        console.log('validateLoginAttempt',request.connection.id);

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


            return true;

        } else if (request.type==='resume' ) {
            return false;
        } else {
            return false;
        }


    });

    // Support for playing D&D: Roll 3d6 for dexterity
    Accounts.onCreateUser(function(options, user) {

        console.log('onCreateUser', options, user);

        var avatarUrl, gender, email;

        // TODO set default avatar image, random pick from X default images

        // Set avatar image, taken from the login service's user object
        if ( user.services.google ) {

            avatarUrl = user.services.google.picture;
            gender = user.services.google.gender;
            email = user.services.google.email;

        } else if ( user.services.facebook ){

            avatarUrl = 'https://graph.facebook.com/'+user.services.facebook.id+'/picture?type=large&height=500&width=500';
            gender = user.services.facebook.gender;
            email = user.services.facebook.email;
        }

        // We still want the default hook's 'profile' behavior.
        if ( options.profile ) {
            user.profile = options.profile;
        }

        user.active = false;

        user.profile.gender = gender;
        user.profile.avatar = avatarUrl;
        user.profile.email = email;


        return user;
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