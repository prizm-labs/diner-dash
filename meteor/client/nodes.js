/**
 * Created by michaelgarrido on 9/13/14.
 */

CustomerLane = function (){
    PRIZM.Node.call(this);
    //Node.call(this);
}


//CustomerLane.prototype = Object.create(Node.prototype);
CustomerLane.prototype = Object.create(PRIZM.Node.prototype);

console.dir(CustomerLane);

_.extend( CustomerLane.prototype, {
    init:  function( x, y, rotation, world ){

        this.world = world;

        // Create object container and rotate to align with radius
        var container = this.world.view.factory.makeGroup2D( 'mainContext',
            { x:x, y:y });
        container.rotate(rotation);
        this.setBody('container', container);

        // Setup entry and exit locations for customer
        this.setLocation('entry', 0, -200);
        this.setLocation('seated', 0, 0);
        this.setLocation('orderPlaced', 0, -105);
        this.setLocation('orderItemOrigin', 0, -112);


        var customer = this.world.view.factory.makeBody2D( 'mainContext', 'customer',
            this.location('entry'),
            { currentFrame:2, frames:true } );
        container.addChild(customer);
        this.setBody('customer',customer);


        var orderBackground = this.world.view.factory.makeBody2D( 'mainContext', 'orderBackground',
            this.location('seated'),
            { currentFrame:0, frames:true, visible: false } );
        orderBackground.fade(0);

        container.addChild(orderBackground);
        this.setBody('orderBg',orderBackground);


        //bind methods
        this.methods({

            customerEnter: function( ){
                var customer = this.body('customer');
                var destination = this.location('seated');

                customer.registerAnimation('rotation',0,0, {parallel:true});
                customer.registerAnimation('position', { x:destination[0], y:destination[1] }, 1);

                customer.runAnimations( function(){
                   customer.setFrame(1);
                });
            },

            customerPlaceOrder: function( orders ){

                orders = ['veggie','meat','drink','veggie','dessert'];

                var self = this;
                var orderBg = this.body('orderBg');

                // TODO what are total length of order bubbles per item count???

                orderBg.setFrame(orders.length-1);

                var orderPositions = [];
                var orderBgWidths = [
                  0, 80, 154, 230, 300
                ];

                // generate positions for dish items
                if (orders.length==1) {
                    orderPositions.push(this.location('orderItemOrigin'));
                } else {
                    orderPositions = Layout.distributePositionsAcrossWidth(
                        this.location('orderItemOrigin'),orders.length,orderBgWidths[orders.length-1]);
                }

                console.log('order positions',orderPositions);

                // create hidden dish items
                _.each(orders, function(order, index){
                    var orderItem = self.world.view.factory.makeBody2D( 'mainContext', 'dish',
                        orderPositions[index],{ variant: order, scale:0.01 } );

                    //TODO add smaller item icons, since child sprites inherit scale from parent

                    self.setBody('order'+index,orderItem);
                    //orderBg.addChild(orderItem);
                    self.body('container').addChild(orderItem);
                });

                this.state['orders'] = orders;



                var goal = this.location('orderPlaced');
                //orderBg.fade(1,0.5);
                orderBg._entity.visible = true;
                orderBg.registerAnimation('alpha',1,0.5,{parallel:true});
                //orderBg.runAnimations();
                orderBg.place( goal[0],goal[1], 1, revealOrder.bind(self));



                function revealOrder(){
                    console.log('order placed');
//                    var orderItem = this.world.view.factory.makeBody2D( 'mainContext', 'dish',
//                        this.location('orderItemOrigin'),{ variant: 'drink', scale:0.01 } );
//
//                    //TODO add smaller item icons, since child sprites inherit scale from parent
//
//                    this.setBody('order1',orderItem);
//                    //orderBg.addChild(orderItem);
//                    this.body('container').addChild(orderItem);
                    for (var i=0;i<this.state['orders'].length;i++){
                        var orderItem = this.body('order'+i);
                        orderItem.registerAnimation('scale',{x:0.5,y:0.5},0.5);
                        orderItem.runAnimations();
                    }



                    console.log('order item', orderItem);
                }
            },

            customerRevealOrder: function(){

            },

            customerUpdateOrder: function( ){

                // Shrink

            },

            customerMakePayment: function( ){

            },

            customerExit: function( ){
                var customer = this.body('customer');
                var destination = this.location('entry');

                customer.rotate( Math.PI);
                customer.place( destination[0], destination[1], 2);
            }
        });
    }
});