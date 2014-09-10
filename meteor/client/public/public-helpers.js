/**
 * Created by michaelgarrido on 9/7/14.
 */
Template.public.rendered = function() {



    visualClientStartup();

    // Register new lobby
    //Meteor.call('activateLobby');

    Session.set('client_type','public');

    if (Session.get('lobby')){
        console.log('auto subscribe to lobby');
        subscriptions.activate.lobby(Session.get('lobby')._id);
    }
    if (Session.get('arena')){
        console.log('auto link client to arena');
        Meteor.call('requestArenaRegistration',Session.get('client_id'),Session.get('arena')._id);
    }
};

Template.public.helpers({
    currentLobby: function(){
        return Session.get('lobby');

    },
    activeGame: function(){
        return Session.get('active_game');
    }
});

Template.public.events({
    'click .register-lobby': function(event){
        subscriptions.activate.lobby(this._id);
        Session.set('lobby',this);


    },
    'click .register-arena': function(event){
        var self = this;
        console.log('requestArenaRegistration',Session.get('client_id'),this._id);

        Meteor.call('requestArenaRegistration',Session.get('client_id'),this._id,function(error,result){
            console.log('after requestArenaRegistration',result);
            if (result) Session.set('arena',result);
        });
    }
});


Template.lobby.helpers({
   usersInLobby: function(){
       return Meteor.users.find().fetch();
   }
});



Template.arenaSettings.helpers({
    usersInArena: function( arenaId ){

        return Meteor.users.find({ arena_id:arenaId}).fetch();

    },
    chosenGame: function( gameId ){

        return Games.findOne( gameId );
    },
    playerStatus: function( arena ){

        return {
            current: Meteor.users.find({ arena_id:arena._id}).fetch().length,
            required: arena.players_required,
            ready: Meteor.users.find({ arena_id:arena._id, readyToPlay:true }).fetch().length
        }

    }
});