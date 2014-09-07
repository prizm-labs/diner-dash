/**
 * Created by michaelgarrido on 9/6/14.
 */
Meteor.publish('activeLobbies', function(){

    return Lobbies.find({ active: true });
});

Meteor.publish('allGames', function(){

    return Games.find();
});

Meteor.publish('usersInLobby', function( lobbyId ){

    return Meteor.users.find({ lobby_id:lobbyId });
});