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

    bindAllStreams();

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

bindAllStreams = function(){


}

bindPublicStreams = function(){

    gameWorld.liveData.addTrigger('servingCustomer',function(args){
        console.log('servingCustomer', args, this);
        //args: direction, trayLoadout, clientId, playerIndex

        var lane = gameWorld.nodesWithTag('customerLane')[args[0]];
        if (!lane.call('isLocked')) {
            lane.apply('serveOrder',[args[1],args[2],args[3]]);

            gameWorld.liveData.broadcast('laneClaimed',[args[0],args[2],args[3]]);
        }
    });

    gameWorld.liveData.addTrigger('registerClientId',function(args){
        console.log('registerClientId', args, this);
        //args: clientId

        gameWorld.liveData.mapCallerToClient(this.subscriptionId,args[0]);
    });

    gameWorld.liveData.addTrigger('paymentReceived',function(args) {
        console.log('paymentReceived', args, this);
        //args: playerIndex, direction

        if (gameWorld.state['pendingEndGame']) {
            console.log('resolving pending lane',gameWorld.state['lanesBeingServed']);
            gameWorld.state['lanesBeingServed'] = _.without(gameWorld.state['lanesBeingServed'],args[0]);

            if (gameWorld.state['lanesBeingServed'].length==0){
                gameWorld.call('initiateEndGame');
            }

        }
    });

}

bindPrivateStreams = function(){

    // Unlock UI once game timer starts
    gameWorld.liveData.addTrigger('gameTimerStart',function(args){
        console.log('gameTimerStart', args, this);
        var queueNode = gameWorld.nodesWithTag('queueNode')[0];
        queueNode.call('unlockOrdering',queueNode.bindUI.bind(queueNode));

        //TODO cleanup timing for binding UI

    });

    // Lock UI once game timer ends
    gameWorld.liveData.addTrigger('gameTimerEnd',function(args){
        console.log('gameTimerEnd', args, this);
        gameWorld.nodesWithTag('queueNode')[0].call('lockOrdering');
    });


    // Show game over screen
    gameWorld.liveData.addTrigger('winnerDeclared',function(args){
        console.log('winnerDeclared', args, this);
        //args: playerIndex

        gameWorld.call('showGameOverModal',args[0]);
    });


    gameWorld.liveData.addTrigger('laneClaimed',function(args){
        console.log('laneClaimed', args, this);
        //args: direction, clientId playerIndex

        if (Session.get('client_id')==args[1]) {
            gameWorld.nodesWithTag('trayNode')[0].apply('laneWon', [args[0]]);
        } else {
            gameWorld.nodesWithTag('trayNode')[0].apply('laneLost', [args[0],args[2]]);
        }
    });

    gameWorld.liveData.addTrigger('updatePlate',function(args){
        console.log('updatePlate', args, this);
        //args: direction, status
        gameWorld.nodesWithTag('trayNode')[0].apply('updatePlate',args);
    });

    gameWorld.liveData.addTrigger('itemConsumed',function(args){
        console.log('itemConsumed', args, this);
        //args: item, clientId

        if (Session.get('client_id')==args[1]) {
            gameWorld.nodesWithTag('queueNode')[0].call('removeItem',args[0]);
        }

    });

    gameWorld.liveData.addTrigger('orderPaid',function(args){
        console.log('orderPaid', args, this);
        //args: clientId, playerIndex, payout, servedItems, direction

        if (Session.get('client_id')==args[0]) {
            gameWorld.nodesWithTag('trayNode')[0].apply('receivePayment',[args[2],args[4]]);
        }

        // Clear lane on all clients
        gameWorld.nodesWithTag('trayNode')[0].call('laneCleared',args[4]);

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

