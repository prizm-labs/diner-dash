/**
 * Created by michaelgarrido on 9/6/14.
 */
// common to client and server

Sessions = new Meteor.Collection('sessions'); // where a client window is open
Lobbies = new Meteor.Collection('lobbies'); // where players in the same location join before activating game
Arenas = new Meteor.Collection('arenas'); // where an active game is played
Games =  new Meteor.Collection('games'); // game in the games library