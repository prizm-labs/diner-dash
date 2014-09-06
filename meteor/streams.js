/**
 * Created by michaelgarrido on 9/5/14.
 */
lobbyStream = new Meteor.Stream('lobby');


chatStream = new Meteor.Stream('chat');

sendChat = function(message,to) {
    chatStream.emit('message', message, to);
    console.log('me: ' + message);
};

sendLogin = function(id,user){
    lobbyStream.emit('login', id, user);
}

if(Meteor.isServer) {
//    lobbyStream.permissions.read(function() {
//        return true;
//    });
//    lobbyStream.permissions.write(function() {
//        return true;
//    });
}

if (Meteor.isClient) {



    chatStream.on('message', function(message, to) {
        console.log('user: ' + message + to );
    });


    lobbyStream.on('login', function( connectionId, user ){
        console.log('loginValidated', connectionId, user);
        if (connectionId == Meteor.connection._lastSessionId){
            console.log('loginValidated', user);
        }


    });

    lobbyStream.on('connect',function( connections ){

        console.log('lobby connect',connections);
        console.log('client connection id',Meteor.connection._lastSessionId);

        var match = _.where(connections, {id:Meteor.connection._lastSessionId} );
        console.log('matched session',match);
    });

}