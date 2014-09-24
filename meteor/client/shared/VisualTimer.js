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

        var modal = this;

        this.super.init.call(this, width, height, backdropOpacity, backdropColor, ctx, world);
    },

    startTimer: function(){
        console.log('startTimer',this);
        this.nodesWithTag('timer')[0].start();
    }

});