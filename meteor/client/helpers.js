/**
 * Created by michaelgarrido on 9/6/14.
 */

Template.public.rendered = function() {

    visualClientStartup();

    // Register new lobby
    //Meteor.call('activateLobby');

    Session.set('client_type','public');
};

Template.public.helpers({

});




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
        Meteor.call('userEnterLobby',Session.get('user')._id,this._id);
        Session.set('lobby',this);
   }
});

Template.arenaConfiguration.events({
    'click .select-game': function(e){

        console.log(this);
        //Meteor.call('userEnterLobby',Session.get('user')._id,this._id);
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
    }
});


// Ensure that registered sessions are being create from browser window
// Prevent headless sessions...
function visualClientStartup(){

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