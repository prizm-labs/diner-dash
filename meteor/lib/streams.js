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

bindStreams = function(){
    var clientType = Session.get('client_type');
    console.log('bindStreams',clientType);

    if (clientType=='public') {
        bindPublicStreams();
    } else if (clientType=='private') {
        bindPrivateStreams();
    }

//    gameWorld.liveData.addTrigger('test',function(data){
//        console.log('stream test', data);
//
//    });
}

bindPublicStreams = function(){

    gameWorld.liveData.addTrigger('servingCustomer',function(args){
        console.log('servingCustomer', args, this);
        //args: direction, trayLoadout
        gameWorld.nodesWithTag('customerLane')[args[0]].call('serveOrder',args[1]);
    });

}

bindPrivateStreams = function(){

    gameWorld.liveData.addTrigger('updatePlate',function(args){
        console.log('updatePlate', args, this);
        //args: direction, status
        gameWorld.nodesWithTag('trayNode')[0].apply('updatePlate',args);
    });

}

//    // http://arunoda.github.io/meteor-streams/stream-context.html
//    // Map subscriptionId (client id)
//    // to user/player
//    // to client type (private || public)
//
//    // register: clientType, userId
//    // return playerId
//
//
//    // Update plates
//    // plates: [true,true,true,true,false,null];
//
//
//    // Update queue
//    // queue: playerId, ['drink','drink','meat','veggie','dessert']
//
//
//    // Check serving
//    // serving: playerId, customerIndex, ['drink','drink','meat','veggie','dessert']
//
//
//    // Send payment
//    // payment: playerId, total, {veggie:1,meat:1,drink:2}

