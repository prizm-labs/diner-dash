/**
 * Created by michaelgarrido on 9/9/14.
 */
gameWorld = {};

gameWorld.registerView = function( view ){
    console.log('gameWorld.registerView',view);
    this.view = view;
}

gameWorld.prepare = function( contexts ){

    console.log('prepareGameWorld', contexts);
    // preload each context

    // setup pubsub to track each context loading
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

}

gameWorld.bindUI = function(){


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

    boxTgt = gameView.UI.addBoxTarget(0,0,screenSize[0], screenSize[1],'hand');
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


    gameView.UI.setTargetGroup('fullscreen',[boxTgt]);


    gameView.present();

}



bindPrivateClientMethods = function(){

    gameWorld.createDefaultWorld = function(){

    }

}

bindPublicClientMethods = function(){

    gameWorld.createDefaultWorld = function(){

    }

}