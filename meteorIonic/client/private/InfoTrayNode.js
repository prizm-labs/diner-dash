/**
 * Created by michaelgarrido on 9/15/14.
 */
InfoTrayNode = function (){
    PRIZM.Node.call(this);
    //Node.call(this);
};

//CustomerLane.prototype = Object.create(Node.prototype);
InfoTrayNode.prototype = Object.create(PRIZM.Node.prototype);

console.dir(InfoTrayNode);

_.extend( InfoTrayNode.prototype, {
    init: function (world) {

        this.world = world;
        this.state['total_coins'] = 0;
        this.state['served_items'] = {
            drink: 0,
            veggie: 0,
            meat: 0,
            dessert: 0
        };


        this,methods({
            updateScore: function( coins, servedTypes ){

            }
        });

    }

});