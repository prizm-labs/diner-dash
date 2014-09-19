/**
 * Created by michaelgarrido on 9/15/14.
 */
Template.private.rendered = function() {

    Session.set('client_type','private');

    visualClientStartup();

};

//https://www.eventedmind.com/classes/meteor-shark-ui-preview/meteor-template-reactivity-in-the-new-ui-system
Template.homeViewPrivate.helpers({
    activeGame: function(){
        return Session.get('activeGame');

    },
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

Template.homeViewPrivate.events({

    'click .sign-out': function(event){
        Meteor.call('deactivateUser',Session.get('user')._id);
        Session.set('user',null);
    },

    'click .leave-lobby': function(event){
        Meteor.call('userLeaveLobby', Session.get('user')._id, Session.get('lobby')._id);
        Session.set('lobby',null);
    }
});


Template.gameViewPrivate.rendered = function(){

    console.log('rendered gameViewPrivate',Session.get('activeGame'));

    gameWorldStartup();
    // Build game world

    // Bind rendering contexts to DOM

    // Preload assets for rendering contexts

    // Bind interaction layer to DOM

    // Notify server that game world is ready

};


// how to access data context inside template event
//http://stackoverflow.com/questions/18879462/meteor-how-can-i-pass-data-between-helpers-and-events-for-a-template
Template.lobbySelection.events({

    'click .select-lobby': function(e){
        console.log(this);
        Meteor.call('userEnterLobby',Session.get('user')._id,this._id, function( error, result ){
            console.log('user after enterLobby',result);
            if (result) Session.set('user',result);
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
            if (result) Session.set('arena',result);
        });
    },

    'click .game-enter': function(event){
        Meteor.call('setPlayerReady',Session.get('user')._id, Session.get('arena')._id, function(error,result){
            console.log('user after setPlayerReady',result);
            if (result) Session.set('user',result);

            // Check if player's arena is ready
            Meteor.call('checkArenaReadyForGame', Session.get('arena')._id, function(error,result){
                if (result) Meteor.call('setupArenaForGame', Session.get('arena')._id );
            });


        });
    },

    'click .game-exit': function(event){
        Meteor.call('cancelPlayerReady',Session.get('user')._id,function(error,result){
            console.log('user after cancelPlayerReady',result);
            if (result) Session.set('user',result);
        });
    }

});


Template.arenaConfiguration.events({
    'click .join-arena': function(event){

        Session.set('arena',this);

        Meteor.call('userEnterArena', Session.get('user')._id,this._id, function( error, result ){
            console.log('user after userEnterArena',result);
            if (result) Session.set('user',result);
        });

    },

    'click .select-game': function(e){

        console.log('user selected game',this);

        Meteor.call('setArenaGame',Session.get('arena')._id, this._id, function(error,result){
            console.log('arena after set game',result);
            if (result) Session.set('arena',result);
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
//    arenaChosen: function(){
//
//        return Session.get('user').arena_id ? true : false;
//
//    },
    arenas: function(){
        return Arenas.find().fetch();
    },
    currentArena: function(){
        return Session.get('arena');
    }
});