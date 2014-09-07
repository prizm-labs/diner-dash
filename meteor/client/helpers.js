/**
 * Created by michaelgarrido on 9/6/14.
 */

// Ensure that registered sessions are being create from browser window
// Prevent headless sessions...
visualClientStartup = function(){

    console.log('Client startup');

    // clear client id binding, so this client will receive global messages from server
    Meteor.ClientCall.setClientId( 'default' );


    // generate local client id for registration on server
    if (!Session.get('client_id')) {
        Session.set('client_id',Meteor.uuid());
        console.log('new client id');
    }
    console.log('client id', Session.get('client_id'));


    Deps.autorun(function(){

        if (Meteor.status().connected){

            console.log('connection open, requesting registration');
            Meteor.ClientCall.setClientId( 'default' );
            Meteor.call('requestClientRegistration',Meteor.connection._lastSessionId);
        }

        // failed

        // waiting

        // offline
    });

}


Template.private.rendered = function() {

    visualClientStartup();

    Session.set('client_type','private');

};

//https://www.eventedmind.com/classes/meteor-shark-ui-preview/meteor-template-reactivity-in-the-new-ui-system
Template.private.helpers({

    name: function(){
        return Session.get('user').profile.name;
    },

    avatar: function(){
        return Session.get('user').profile.avatar;
    },

    userLoggedIn: function(){
        return Session.get('user') ? true : false;
    },

    userChoseLobby: function(){
        return Session.get('lobby') ? true : false;
    },

    currentLobby: function() {
        return Session.get('lobby').title;
    }
});

Template.private.events({

    'click .sign-out': function(event){
        Meteor.call('deactivateUser',Session.get('user')._id);
        Session.set('user',null);
    },

    'click .leave-lobby': function(event){
        Meteor.call('userLeaveLobby', Session.get('user')._id, Session.get('lobby')._id);
        Session.set('lobby',null);
    }
});




// how to access data context inside template event
//http://stackoverflow.com/questions/18879462/meteor-how-can-i-pass-data-between-helpers-and-events-for-a-template
Template.lobbySelection.events({

   'click .select-lobby': function(e){
        console.log(this);
       Meteor.call('userEnterLobby',Session.get('user')._id,this._id, function( error, result ){
           console.log('user after enterLobby',result);
           Session.set('user',result);
       });

        Session.set('lobby',this);
        subscriptions.activate.lobby(this._id);
   }
});



Template.gameOptions.helpers({

    requiredPlayerOptions: function(){

        var options = [];

        for (var count=1;count<=Session.get('game').player_limit;count++){
            options.push({value:count});
        }

        return options;
    }

});

Template.gameOptions.events({

    'click .set-player-count': function(event){
        Meteor.call('setArenaPlayersRequired',Session.get('arena')._id,this.value,function(error,result){
            console.log('arena after setArenaPlayersRequired',result);
            Session.set('arena',result);
        });
    },

    'click .game-enter': function(event){
        Meteor.call('setPlayerReady',Session.get('user')._id, Session.get('arena')._id, function(error,result){
            console.log('user after setPlayerReady',result);
            Session.set('user',result);
        });
    },

    'click .game-exit': function(event){
        Meteor.call('cancelPlayerReady',Session.get('user')._id,function(error,result){
            console.log('user after cancelPlayerReady',result);
            Session.set('user',result);
        });
    }

});


Template.arenaConfiguration.events({
    'click .join-arena': function(event){

        Session.set('arena',this);

        Meteor.call('userEnterArena', Session.get('user')._id,this._id, function( error, result ){
            console.log('user after userEnterArena',result);
            Session.set('user',result);
        });

    },

    'click .select-game': function(e){

        console.log('user selected game',this);

        Meteor.call('setArenaGame',Session.get('arena')._id, this._id, function(error,result){
            console.log('arena after set game',result);
            Session.set('arena',result);
        });
        Session.set('game',this);
    }
});

Template.arenaConfiguration.helpers({
    gameChosen: function(){
        return Session.get('game') ? true : false;
    },
    gameContext: function(){
        return {
            title: Session.get('game').title,
            ageRestriction: Session.get('game').age_restriction,
            description: Session.get('game').description
        }
    },
    arenaChosen: function(){

        return Session.get('user').arena_id ? true : false;

    },
    arenas: function(){
        return Arenas.find().fetch();
    },
    currentArena: function(){
        return Session.get('arena');
    }
});