/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function() {


});


Meteor.ClientCall.methods({

    // if server onConnection executes before client status().connected updated
    'onConnect': function( args ){

        var connectionId = args[0], clientId = Session.get('client_id'), clientType =  Session.get('client_type');
        //console.log('onConnect client', connectionId, Meteor.connection._lastSessionId);

        if ( Meteor.connection._lastSessionId == connectionId ){
            console.log( 'onConnect paired connection id', connectionId );
            Meteor.call( 'registerClient', clientId, connectionId, Session.get('client_type') );
            Meteor.ClientCall.setClientId( clientId );

            // If private client, auto login user
            var user = Session.get('user');
            if ( user && clientType == 'private' ) {

                console.log('auto set user',user);
                Meteor.call('setUser', user);
                Meteor.call('setViewerForClient', clientId, user._id );

                if (user.lobby_id){
                    subscriptions.activate.lobby(user.lobby_id);
                }

                if (user.arena_id){
                    //Session.set
                }
//                Meteor.call('activateUser', user._id, clientId, connectionId, function( error, result ){
//                    console.log('user after activateUser',result);
//                    Session.set('user',result);
//                });
//
//                if (user.lobby_id){
//                    Meteor.call('userEnterLobby',Session.get('user')._id,this._id, function( error, result ){
//                        console.log('user after enterLobby',result);
//                        Session.set('user',result);
//                    });
//                }
            }
        }

    },

    'onLogin': function( args ) {
        console.log('onLogin client', args);

        var connectionId = args[0], user = args[1], clientId = Session.get('client_id');

        if ( Meteor.connection._lastSessionId == connectionId ){

            Meteor.logout();

            console.log('onLogin paired connection id',Meteor.connection._lastSessionId);

            Session.set('user',user);
            console.log('active user',Session.get('user'));

            Meteor.call('activateUser', user._id, clientId, connectionId, function( error, result ){
                console.log('user after activateUser',result);
                Session.set('user',result);
            });
        }
    },


    'onArenaReady': function( args ){

        console.log('onArenaReady', args);

        // bind current user to player in game state


        connectionStore = subscriptions.activate.gameState(args.gameStateId);
        //Session.set('activeGame',args);
        Session.set('gameState_id',args.gameStateId);

        prepareGameWorld( args.contexts[Session.get('client_type')] );

        /*
        * connectionStore = Meteor.connection.registerStore('nodes', {
         beginUpdate: function( batchSize, reset ){
         //console.log('beginUpdate nodes', batchSize, reset);
         },
         update: function( msg ){
         //console.log('update nodes', JSON.stringify(msg));
         liveDataDelegate.updateSubscriptions( msg );
         },
         endUpdate: function(){
         //console.log('endUpdate nodes');
         },
         saveOriginals: function(){
         //console.log('saveOriginals');
         },
         retrieveOriginals: function(){
         //console.log('retrieveOriginals');
         }
         });
        * */
    }

});

function prepareGameWorld( contexts ){


    console.log('prepareGameWorld', contexts);
    // preload each context

    // setup reactive object to track once each context loading

    // when all contexts loaded, notify server
    amplify.subscribe('preloadView',function( data ){
        Meteor.call('clientReadyForGameSession',Session.get('client_id'),Session.get('arena')._id)
    });

    gameView = new PRIZM.View( 'main', Session.get('viewport_width'), Session.get('viewport_height') );
    gameView.createUIManager( 'hit-area' );

    _.each( contexts, function( context, key ){
        if (context.type=='2D') {
            gameView.createContext2D( key, context.domAnchor, 'canvas',
                context.manifest, context.atlas.map,
                Session.get('viewport_width'), Session.get('viewport_height')
            );
        }
    });

    gameView.preload();

    gameView.onLoadComplete = function(){

//        b1 = this.factory.makeBody2D( 'hand', 'terrain', { x:100, y:100}, { variant: 'pasture' } );
//        b2 = this.factory.makeBody3D( 'field', 'road', 0,0,0);
//
//        liveDataDelegate.registerSubscription( 'nodes', 'qwiyKk5SFwZG9E4ca', function( fields ){
//            b1.place( fields.x||null, fields.y||null, 0 );
//        });
//        var gameMaster = new GameMaster( VARIANTS["threeToFourPlayers"], this.factory );
//        gameMaster.init( this.factory );
//        gameMaster.setupNodeMatrix();


        // Render private view bodies (i.e. hand)

        boxTgt = this.UI.addBoxTarget(0,0,screenSize[0], screenSize[1],'hand');
        boxTgt.setBehavior( 'tap', null, null, function( event ){
            console.log('box tap stop',event);
        });
        boxTgt.setBehavior( 'pan',
            function( event ){
                console.log('box pan start',event);
            },
            function( event ){
                console.log('box pan update',event);
                //b1.place( b1.x+event.deltaX, b1.y+event.deltaY );
                b1.place( event.center.x, event.center.y, 0 );
                Meteor.call('updateNode',"qwiyKk5SFwZG9E4ca",{x:event.center.x,y:event.center.y})
            },
            function( event ){
                console.log('box pan stop',event);
            });
        boxTgt.activate();


        this.UI.setTargetGroup('fullscreen',[boxTgt]);


        this.present();
    };
}