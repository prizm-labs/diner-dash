/**
 * Created by michaelgarrido on 9/9/14.
 */
gameWorld = new PRIZM.GameWorld();

//gameWorld = null;
//
//if (Session.get('gameWorld')) {
//    gameWorld = Session.get('gameWorld');
//} else {
//    console.log('new gameWorld');
//    gameWorld = new PRIZM.GameWorld();
//    Session.set('gameWorld',gameWorld);
//}

bindPrivateClientMethods = function( key, methods ){
    console.log('bindPrivateClientMethods');

    gameWorld.methods({
        setupDefaultWorld: function(){
            console.log('setupDefaultWorld',this);
            b1 = this.view.factory.makeBody2D( 'mainContext', 'dish', { x:100, y:100}, { variant: 'drink' } );
        }
    });

}

bindPublicClientMethods = function(){
    console.log('bindPublicClientMethods');

    gameWorld.methods({
        setupDefaultWorld: function(){
            console.log('setupDefaultWorld',this);
            b1 = this.view.factory.makeBody2D( 'mainContext', 'dish', { x:100, y:100}, { variant: 'meat' } );
        }
    });

}


Deps.autorun(function(){

    if (Session.get('client_type')){

        if (Session.get('client_type')==='private') {
            bindPrivateClientMethods();
        } else if (Session.get('client_type')==='public') {
            bindPublicClientMethods();
        }

    }

});


