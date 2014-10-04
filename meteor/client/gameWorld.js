/**
 * Created by michaelgarrido on 9/9/14.
 */
gameWorld = new PRIZM.GameWorld();


gameWorldStartup = function(){
    // restore gameWorld from HCP
    if (Session.get('gameState_configuration')){
        createGameWorldFromConfiguration( Session.get('gameState_configuration') );
    }
};

resetGameWorld = function(){


    // TODO read from gameState config to clear sounds, DOM, etc.
    //var config = Session.get('gameState_configuration');

    if (Session.get('client_type')=='public') {
        //TODO Stop background music
        gameWorld.sound.sounds['background-gameover'].pause();
    }

    // Remove all amplify pubsub subscriptions
    //http://stackoverflow.com/questions/13402893/how-to-unsubscribe-from-amplify-within-subscribe-function
    gameWorld.unsubscribeAll();

    // Remove all children bodies
    // Remove all nodes
    $('#context2D-main').empty();

    gameWorld = new PRIZM.GameWorld();

    // Bind private / public methods
    bindGameWorldMethodsByClientType(Session.get('client_type'));
};

bindGameWorldMethodsByClientType = function(clientType) {

    if (clientType==='private') {
        bindPrivateClientMethods();
    } else if (clientType==='public') {
        bindPublicClientMethods();
    }

};

transitionLobbyToGameWorld = function(){

    //TODO set DOM selectors dynamically
    $('#home-view').hide();
    $('#hit-area').show();
};

transitionGameWorldToLobby = function(){

    //TODO set DOM selectors dynamically
    $('#home-view').show();
    $('#hit-area').hide();
};



createGameWorldFromConfiguration = function( config ){
    console.log('createGameWorldFromConfiguration',config);

    //TODO show loading screen

    // Transition to loading screen from lobby
    transitionLobbyToGameWorld();

    // TODO Subscribe to gameState document, shared with all clients
    //connectionStore = subscriptions.activate.gameState(config.gameStateId);

    if (!gameWorld.checkPreloadComplete()){
        gameWorld.prepare(
            config.contexts[Session.get('client_type')],
            config.gameState.players,
            {
                entries:config.sounds.entries[Session.get('client_type')],
                directory:config.sounds.directory
            }
        );
    }

    // Once gameState received from server
    // update gameWorld accordingly

    // if a client disconnects
    // pause game

    // if all clients reconnected
    // allow resume game clock

    // TODO define DDP bindings for gameWorld
    // TODO define stream bindings for gameWorld

    //

//    connectionStore = Meteor.connection.registerStore('nodes', {
//     beginUpdate: function( batchSize, reset ){
//     //console.log('beginUpdate nodes', batchSize, reset);
//     },
//     update: function( msg ){
//     //console.log('update nodes', JSON.stringify(msg));
//     //liveDataDelegate.updateSubscriptions( msg );
//     },
//     endUpdate: function(){
//     //console.log('endUpdate nodes');
//     },
//     saveOriginals: function(){
//     //console.log('saveOriginals');
//     },
//     retrieveOriginals: function(){
//     //console.log('retrieveOriginals');
//     }
//     });

}