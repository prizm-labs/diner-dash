/**
 * Created by michaelgarrido on 9/5/14.
 */
//lobbyStream = new Meteor.Stream('lobby');
//chatStream = new Meteor.Stream('chat');
//
//sendChat = function(message,to) {
//    chatStream.emit('message', message, to);
//    console.log('me: ' + message);
//};
//
//sendLogin = function(id,user){
//    lobbyStream.emit('login', id, user);
//}


// Bind gameState streams
// prefix events with gameState id


/*
 Server:
 is solely authorized to update gameState document
 monitoring messages between clients to determine when & what to write to document



 Client:
 user logged in
 gamestateId received
 request gameStream for gameState

 Server:
 if stream not present
 create stream with gameStateID

 return streamIsReady

 Client:
 on ready response
 register
 */


bindGameStream = function( streamId ){

    console.log('bindGameStream',streamId);

    // Client-to-client stream
    var streamC2C = new Meteor.Stream(streamId);

    // Public VS Private client ???


    // http://arunoda.github.io/meteor-streams/stream-context.html
    // Map subscriptionId (client id)
    // to user/player
    // to client type (private || public)

    // register: clientType, userId
    // return playerId


    // Update plates
    // plates: [true,true,true,true,false,null];


    // Update queue
    // queue: playerId, ['drink','drink','meat','veggie','dessert']


    // Check serving
    // serving: playerId, customerIndex, ['drink','drink','meat','veggie','dessert']


    // Send payment
    // payment: playerId, total, {veggie:1,meat:1,drink:2}


    if(Meteor.isServer) {


        // Permissions
        streamC2C.permissions.read(function() {
            return true;
        });
        streamC2C.permissions.write(function() {
            return true;
        });


        // Filters
        streamC2C.addFilter(function(eventName, args){
            return args;
        });


        // Test Events
        setInterval(function() {
            streamC2C.emit('test', 'server generated event');
        }, 1000);
    }

    if (Meteor.isClient) {

        streamC2C.on('test', function(data){
           console.log('stream test', data);
        });

    }

    return streamC2C;
};


