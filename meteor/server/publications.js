/**
 * Created by michaelgarrido on 9/6/14.
 */
Meteor.publish('activeLobbies', function(){

    return Lobbies.find({ active: true });
});

Meteor.publish('allGames', function(){

    return Games.find();
});