/**
 * Created by michaelgarrido on 9/15/14.
 */
bindPrivateClientMethods = function( key, methods ){
    console.log('bindPrivateClientMethods');

    gameWorld.methods({
        setupDefaultWorld: function(){
            console.log('setupDefaultWorld',this);
            var self = this;

            config = Session.get('gameState_configuration');

            // Set global background colors
            this.view.contexts['mainContext'].setBackgroundColor('#FFFFFF');

            var queueNode = new QueueNode();
            queueNode.init(self);

            var trayNode = new TrayNode();
            trayNode.init(self);
        }
    });

}