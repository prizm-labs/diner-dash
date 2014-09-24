/**
 * Created by michaelgarrido on 9/22/14.
 */
CountdownModal = function (){
    PRIZM.Nodes.Modal.call(this);
    this.super = PRIZM.Nodes.Modal.prototype;
};

CountdownModal.prototype = Object.create(PRIZM.Nodes.Modal.prototype);

console.dir(CountdownModal);

_.extend( CountdownModal.prototype, {

    init: function(width, height, backdropOpacity, backdropColor, ctx, world){

        this.super.init.call(this, width, height, backdropOpacity, backdropColor, ctx, world);
        this.prepare('none','none',
            function(){
                var self = this;
                var countdownText = self.world.view.factory.makeBody2D( this.ctx,
                    'text', [0,0], { text:3,
                        styles:{
                            font: 'normal 100px Helvetica',
                            fontSize: 100,
                            fill: 'white'
                        }});
                countdownText.centerText();
                self.body('container').addChild(countdownText);
                self.setBody('countdownText',countdownText);
            },
            function(){

            },
            function(){

            });
    }

});