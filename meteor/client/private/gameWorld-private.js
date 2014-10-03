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
            self.addNode(queueNode);

            var trayNode = new TrayNode();
            trayNode.init(self,Session.get('playerIndex'));
            self.addNode(trayNode);

            gameOverModal = new GameOverPrivateModal();
            gameOverModal.init(self.view.width,self.view.height,0.5,'#000000','mainContext',self);
        },
        showGameOverModal: function(winningPlayerIndex){
            var self = this;
            var status;

            if (Session.get('playerIndex') == winningPlayerIndex){
                status = true;
            } else if (winningPlayerIndex==null) {
                status = null;
            } else {
                status = false;
            }

            gameOverModal.present(status);
        }
    });

}