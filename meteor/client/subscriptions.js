/**
 * Created by michaelgarrido on 9/6/14.
 */
Meteor.subscribe('activeLobbies');
Meteor.subscribe('allGames');

subscriptions = {
    activate: {
        lobby: function( lobbyId ){
            Meteor.subscribe('usersInLobby', lobbyId);
            Meteor.subscribe('arenasInLobby', lobbyId);
        },
        gameState: function( gameStateId ){
            Meteor.subscribe('activeGame', gameStateId);

            var connectionStore = Meteor.connection.registerStore('activeGame', {
                beginUpdate: function( batchSize, reset ){
                    console.log('beginUpdate nodes', batchSize, reset);
                },
                update: function( msg ){
                    console.log('update nodes', JSON.stringify(msg));
                    //liveDataDelegate.updateSubscriptions( msg );
                },
                endUpdate: function(){
                    console.log('endUpdate nodes');
                },
                saveOriginals: function(){
                    console.log('saveOriginals');
                },
                retrieveOriginals: function(){
                    console.log('retrieveOriginals');
                }
            });

            return connectionStore;
        }
    }
};