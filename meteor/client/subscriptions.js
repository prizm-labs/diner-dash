/**
 * Created by michaelgarrido on 9/6/14.
 */
Meteor.subscribe('activeLobbies');
Meteor.subscribe('allGames');

subscriptions = {
    activate: {
        lobby: function( lobbyId ){
            Meteor.subscribe('usersInLobby', lobbyId);
        }
    }
}