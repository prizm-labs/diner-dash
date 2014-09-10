/**
 * Created by michaelgarrido on 9/7/14.
 */
generateGameState = function( gameId, users, configJson ){

    // GOAL return an object that tells private and public clients:
    // 1) SYNCHRONIZATION: the game state session and how to subscribe to live data
    // 2) RENDERING: atlases & colors for rendering per context 2D/3D
    // 3) BALANCING: templates & limits for game objects during game

    var config = JSON.parse(Assets.getText(configJson));

    // 1) SYNCHRONIZATION
    var session = _.extend({}, config['session']);

    // merge in users to players
    _.each( users, function( user ){
        session.players.push( mergePlayer( user, config['player'] ))
    });

    for (var i=0;i<config['limits']['seats'];i++){
        session.seats.push(_.clone(config["seat"]));
    }

    // enter state into DB and return reference
    var gameStateId = GameStates.insert(session);


    // 2) RENDERING
    // for this game, public & private clients receive identical context configuration
    // TODO different context config for clients (2D+3D vs 2D only)


    var contexts = _.pick(config,'mainContext');
    // merge in manifest as object from JSON
    _.each( contexts, function(context){
        context.manifest =  JSON.parse(Assets.getText(context.manifest[0]))[context.manifest[1]];
    });

    var allContexts = {
        "private": contexts,
        "public": contexts
    };


    // 3) FACTORY
    var factory = _.pick(config,'customer','dishes','limits');

    return {
        gameId: gameId,
        gameStateId: gameStateId,
        contexts: allContexts,
        factory: factory
    };
};

function mergePlayer( user, playerTemplate ){

    return _.extend(_.clone(playerTemplate), {
        "name": user.profile.name,
        "user_id": user._id,
        "avatar": user.profile.avatar
    });

}

GameClock = (function() {

    function GameClock() {
        this.currentTime = 0;
        this.timeLimit = null;

        this.stream = null;
        this.active = false;
    }

    GameClock.prototype = {

        bindStream: function (stream) {

            this.stream = stream;
        },

        start: function () {

        },

        stop: function () {

        },

        broadcastUpdate: function(){

            // if this timeLimit

        }
    }


    return GameClock;
})();