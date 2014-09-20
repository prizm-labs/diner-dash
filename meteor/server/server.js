/**
 * Created by michaelgarrido on 9/4/14.
 */

//MongoDB document modifiers
// http://docs.mongodb.org/manual/tutorial/modify-documents/#Updating-ModifierOperations

LiveData = new LiveDataDelegate();

Meteor.methods({

    // Stream helpers
    'requestGameStream': function( clientId, gameStateId ){

        if (!LiveData.streams[gameStateId]) {

            console.log('new game stream',gameStateId);
            LiveData.setupStream(gameStateId);
            LiveData.activateStream(gameStateId);

            // Add client id to args
//            LiveData.addFilter(function(eventName, args){
//                return args;
//            });
        }

//        setInterval(function() {
//            LiveData.broadcast('test', 'server generated event');
//        }, 1000);


        //{"_id" : "61175b8e-101f-4434-b171-cafa16e5adf5",
        // "connection" : "PkbdnPDiTfFEcHk5g",
        // "type" : "public",
        // "viewer_id" : null, "arena_id" : null, "preloaded" : true }

        //{ "_id" : "4954e8e2-725f-4888-a4bc-7423b699e41f",
        // "arena_id" : "gweQHKJMBKttNbNE2",
        // "connection" : "pwjPtgTBDZ2rbbxJp", "preloaded" : true,
        // "type" : "private", "viewer_id" : "MRpCw97a4tnH6GmXL" }

        return true;
    },

    // Shape helpers
    'curveAroundOrigin': function( origin, width, height, steps ){
        console.log('quadraticCurveAroundOrigin');

        var s = new Shape();

        var a = [ origin.x-width/2, origin.y ];
        var b = [ origin.x+width/2, origin.y ];

        s.moveTo(a[0],a[1]);
        s.quadraticCurveTo( origin.x,origin.y-height*2, b[0],b[1], steps );

        console.log(s.points);

        return _.clone(s.points);
    },

    'registerClient': function( clientId, connectionId, type ){

        console.log('setting clientId & connectionId', clientId, connectionId);

        Sessions.upsert( clientId ,{
            '_id':clientId, 'connection':connectionId,
            'type':type, 'viewer_id':null, 'arena_id':null, 'preloaded':false });

        console.log('registered sessions', Sessions.find().fetch());
    },

    'setViewerForClient': function( clientId, viewerId ){

        console.log( 'setViewerForClient', clientId, viewerId );

        Sessions.update( clientId, {$set: { viewer_id:viewerId }});
    },

    'requestClientRegistration': function( connectionId ){

        console.log('requestRegistration', connectionId );
        Meteor.ClientCall.apply( 'default', 'onConnect', [ [connectionId] ],
            function(){ console.log('client called from server'); });
    },

    'requestArenaRegistration': function( clientId, arenaId ){

        console.log('requestArenaRegistration', clientId, arenaId  );

        // TODO limit registration of public clients per arena
//        var targetArena = Arenas.findOne( arenaId );
//        var boundArena = Arenas.findOne( {client_id:clientId} );
//
//        console.log('target arena & arena linked to clientId',targetArena,boundArena);
//
//        if ( targetArena.client_id===null && (boundArena==null || boundArena=='undefined') ){

        // Two-way Link public client and arena
        Sessions.update( clientId, { $set: {arena_id:arenaId} });
        Arenas.update( arenaId, { $set:{ client_id: clientId }});

        return Arenas.findOne( arenaId );
//            return true;
//        } else {
//            return false;
//        }

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

            return Meteor.users.findOne( userId );
        }

    },

    'setUser': function( user ){

        console.log('user set, full document replacement');
        Meteor.users.update( user._id, user );
    },

    'deactivateUser': function( playerId ){

        console.log('deactivate player bound to session',playerId);
        Meteor.users.update( playerId, { $set: {
            active: false, client_id: null,
            lobby_id: null, arena_id: null,
            readyToPlay: false
        } } );

        Sessions.update({ viewer_id: playerId, type: 'private'}, { $set: { viewer_id: null } });
    },

    'userEnterLobby': function( userId, lobbyId ){

        console.log('userEnterLobby',userId, lobbyId);
        Meteor.users.update( userId, { $set: { lobby_id: lobbyId } } );
        //Lobbies.update( lobbyId, { $set: {} } )

        return Meteor.users.findOne( userId );
    },

    'userLeaveLobby': function( userId, lobbyId ){

        console.log('userLeaveLobby',userId, lobbyId);
        Meteor.users.update( { _id: userId, lobby_id: lobbyId }, { $set: { lobby_id: null } } );
        //Lobbies.update( lobbyId, { $set: {} } )


    },

    'userEnterArena': function( userId, arenaId ){
        console.log('userEnterArena',userId, arenaId );
        Meteor.users.update( { _id: userId }, { $set: { arena_id: arenaId } } );

        console.log('user',Meteor.users.findOne(userId));
        // Also bind user's arena to user's client to check if client preloaded for game
        Sessions.update( {_id:Meteor.users.findOne(userId).client_id}, {$set:{ arena_id:arenaId }});

        return Meteor.users.findOne( userId );
    },

    'userLeaveArena': function( userId, arenaId ){
        console.log('userLeaveArena',userId, arenaId );
        Meteor.users.update( { _id: userId, arena_id:arenaId }, { $set: { arena_id: null } } );

        return Meteor.users.findOne( userId );
    },

    'setArenaGame': function( arenaId, gameId ){

        console.log('setArenaGame',arenaId,gameId);

        Arenas.update({ _id:arenaId },{$set:{ game_id:gameId }})

        return Arenas.findOne(arenaId);
    },

    'setArenaPlayersRequired': function( arenaId, playersRequired ){

        console.log('setArenaPlayersRequired',arenaId, playersRequired);

        Arenas.update( arenaId, { $set: { players_required:playersRequired } });

        return Arenas.findOne(arenaId);
    },

    'setPlayerReady': function( userId, arenaId ){
        console.log('setPlayerReady',userId);
        Meteor.users.update(userId, {$set: { readyToPlay: true }});

        // Link user's current arena to user's session
        Sessions.update( Sessions.findOne( {viewer_id:Meteor.users.findOne(userId)._id} ),
            { $set: { arena_id:arenaId } });

        return Meteor.users.findOne( userId );
    },

    'cancelPlayerReady': function( userId ){
        console.log('cancelPlayerReady',userId);
        Meteor.users.update(userId, {$set: { readyToPlay: false }});
        return Meteor.users.findOne( userId );
    },

    'registerPublicClientForGame': function( clientId, gameId ) {

        console.log('registerPublicClientForGame', clientId, gameId);
    },

    'checkArenaReadyForGame': function( arenaId ){

        var arena = Arenas.findOne(arenaId);
        var playersReady = Meteor.users.find({ arena_id:arenaId, readyToPlay:true }).fetch();

        console.log('checking arena for players ready',arena,playersReady);

        if ( (arena.players_required === playersReady.length) && (arena.client_id!==null) ){

            // track clients ready: preloaded audio & visual assets
            //TODO how to track/handle client ready if multiple public clients or ad hoc private clients???
            Arenas.update( arenaId, { $set: { clients_required: playersReady.length+1, players: _.pluck(playersReady,'_id') }});

            console.log('arena is ready');
            console.log('arena client id',arena.client_id);

            return true;

        } else {
            console.log('waiting for players',arena.players_required-playersReady.length);
            console.log('arena client id',arena.client_id);

            return false;
        }

    },

    'clientReadyForGameSession': function( clientId, arenaId ){
        console.log('clientReadyForGameSession',clientId, arenaId);

        // set client preloaded
        Sessions.update(clientId, {$set:{ preloaded: true }});

        // count clients preloaded
        var linkedClients = Sessions.find({ arena_id:arenaId, preloaded:true}).fetch();
        var arena = Arenas.findOne(arenaId);
        console.log('clients linked to arena',linkedClients.length,arena);

        if ( arena.clients_required===linkedClients.length ){
            console.log('all clients preloaded');
            // Begin game clock
        }
    },

    'setupArenaForGame': function( arenaId ){
        console.log('setupArenaForGame',arenaId);
        var clients = [];
        var arena = Arenas.findOne(arenaId);
        var users = Meteor.users.find({arena_id:arenaId}).fetch();

        // get all private clients
        _.each( users,function( user ){
            clients.push( user.client_id );
        });

        // get public client
        clients.push(arena.client_id);

        // generate initial gameState from game configuration
        var gameState = generateGameState( arena.game_id, users, 'game-config.json' );

        // broadcast to all valid clients
        console.log('notifying clients of game start',clients);

        // Return game configuration options
        // Return players so all clients can preload & render their name,avatar,etc.
        _.each(clients, function(clientId){
            Meteor.ClientCall.apply( clientId, 'onArenaReady', [gameState],
                function(){ console.log('client called from server'); });
        });
    }

});




function teardownSession( connection ){

    console.log('connection closed !!!',connection);

    var session = Sessions.findOne({"connection":connection.id});

    console.log('session matching closed connection', session);
    if (session) {

        var playerId = session.viewer_id, sessionType = session.type;

        // Disassociate session client from arenas
        var linkedArena = Arenas.findOne({client_id:session._id});
        console.log('linked arena to client',linkedArena);
        if ( linkedArena ){
            Arenas.update( {_id:linkedArena._id}, {$set:{client_id:null}});
            console.log('unlinking client from arena', linkedArena);
        }

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

        Meteor.ClientCall.apply( 'default', 'onConnect', [ [connection.id] ],
            function(){ console.log('client called from server'); });

        connection.onClose( function(){teardownSession(connection)});
    });


    // refactor service configuration for production
    // http://stackoverflow.com/questions/17140483/how-do-i-reconfigure-meteors-accounts-facebook-or-where-is-meteors-facebook-c
    Accounts.loginServiceConfiguration.remove({
        service: "facebook"
    });

    // PRODUCTION
//    Accounts.loginServiceConfiguration.insert({
//        service: "facebook",
////        appId: 697413780331229,
////        secret: "ed58a86e0c972fef62b79e324e26a10d"
//        appId: process.env.FACEBOOK_APP_ID,
//        secret: process.env.FACEBOOK_APP_SECRET
//    });

    // DEVELOPMENT
    Accounts.loginServiceConfiguration.insert({
        service: "facebook",
        appId: 724819690923971,
        secret: "8c71f216862925e5420b50da00fc90f5"
//        appId: process.env.FACEBOOK_APP_ID,
//        secret: process.env.FACEBOOK_APP_SECRET
    });

    // https://console.developers.google.com/project
    // REDIRECT URIS
    // http://localhost:3000/_oauth/google?close

    // JAVASCRIPT ORIGINS
    //  http://localhost:3000/

    // Reset Google login configuration
    // http://stackoverflow.com/questions/17098307/how-do-i-reset-google-login-configuration-once-i-have-set-it-for-my-meteor-app

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

            user.avatarNeedsResolution = false;

        } else if ( user.services.facebook ){

            avatarUrl = 'https://graph.facebook.com/'+user.services.facebook.id+'/picture?type=large&height=500&width=500';
            gender = user.services.facebook.gender;
            email = user.services.facebook.email;

            user.avatarNeedsResolution = true;

            // Replace user avatar with CDN URL
            updateFacebookProfileUrl(user.services.facebook.id,user._id);
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

        // TODO update avatar on login

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

// Replace user avatar with CDN URL
updateFacebookProfileUrl = function (fbUserId, userId) {

    Meteor.http.get('https://graph.facebook.com/'+fbUserId+'/picture?type=large&width=500&height=500&redirect=false',
        function ( error, result ) {
            console.log('Facebook user avatar CDN url',error, result);
            // i.e. http://graph.facebook.com/517267866/?fields=picture&type=large&redirect=true
            var cdnUrl = result.data.data.url;
            if (!error && cdnUrl) {
                Meteor.users.update( userId,
                    {$set:{'profile.avatar':cdnUrl,'avatarNeedsResolution':false}});
                console.log('updated user avatar to CDN url',cdnUrl);
            }
        });
}