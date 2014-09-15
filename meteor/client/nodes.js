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
        this.setLocation('plateOrigin',0,120);


        var customer = this.world.view.factory.makeBody2D( 'mainContext', 'customer',
            this.location('entry'),
            { currentFrame:2, frames:true, visible:false } );
        customer.fade(0);
        container.addChild(customer);
        this.setBody('customer',customer);


        var orderBackground = this.world.view.factory.makeBody2D( 'mainContext', 'orderBackground',
            this.location('seated'),
            { currentFrame:0, frames:true, visible: false } );
        orderBackground.fade(0);
        container.addChild(orderBackground);
        this.setBody('orderBg',orderBackground);


        var plate = this.world.view.factory.makeBody2D( 'mainContext', 'seat',
            this.location('plateOrigin'),
            { variant: 'neutral' } );
        container.addChild(plate);
        this.setBody('plate',plate);



        //bind methods
        this.methods({

            customerEnter: function( ){
                var customer = this.body('customer');
                var destination = this.location('seated');

                customer.registerAnimation('rotation',0,0, {parallel:true});
                customer._entity.visible = true;
                customer.registerAnimation('alpha',1,0.5,{parallel:true});
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

                    orderItem.addTag(order);
                    orderItem.addTag('order');
                    self.setBody('order'+index,orderItem);
                    //orderBg.addChild(orderItem);
                    self.body('container').addChild(orderItem);
                });

                this.state['orders'] = orders;



                var goal = this.location('orderPlaced');
                orderBg._entity.visible = true;
                orderBg.registerAnimation('alpha',1,0.5,{parallel:true});
                orderBg.place( goal[0],goal[1], 1, revealOrder.bind(self));


                function revealOrder(){
                    console.log('order placed');
                    //TODO add smaller item icons, since child sprites inherit scale from parent

                    for (var i=0;i<this.state['orders'].length;i++){
                        var orderItem = this.body('order'+i);
                        //var orderItem = this.bodiesWithTag('order')[i];
                        orderItem.registerAnimation('scale',{x:0.5,y:0.5},0.5);
                        orderItem.runAnimations();
                    }



                    console.log('order item', orderItem);
                }
            },

            customerRevealOrder: function(){

            },

            customerUpdateOrder: function( servings ){
                var self = this;
                servings = ['veggie','drink','meat'];

                // Find servings matched to orders
                //var served = _.intersection(this.state['orders'],servings);
                this.state['served'] = _.intersection(this.state['orders'],servings);

                this.state['orders'] = _.difference(this.state['orders'],servings);
                console.log('items to serve',this.state['served'] );


                this.call('consumeNextItem',function(){
                    console.log('all items served');
                });

                // Regenerate order bubble
                console.log('orders after serving',this.state['orders']);
            },


            consumeNextItem: function( callback ){
                console.log('consumeNextItem',this.state['served']);
                var self = this;

                if (this.state['served'].length==0) {
                    callback();
                } else {
                    var itemToServe = this.state['served'][0];
                    this.apply('consumeItem', [itemToServe, function(){
                        console.log('recursive consumption');

//                        self.state['served'] = _.without(self.state['served'],itemToServe);
                        self.state['served'].splice(0,1);
                        self.call('consumeNextItem',callback);
                    }])
                }




            },


            consumeItem: function( item, callback ) {
                console.log('consumeItem', callback);
                var self = this;

                var customer = this.body('customer');

                // Open customer mouth
                customer.setFrame(0);

                // Create served dishes in front of customer
                var servedItem = this.world.view.factory.makeBody2D( 'mainContext', 'dish',
                    this.location('plateOrigin'),{ variant: item, scale:0.01 } );
//                var orderItem = self.world.view.factory.makeBody2D( 'mainContext', 'dish',
//                    orderPositions[index],{ variant: order, scale:0.01 } );

                //this.setBody('served'+index,servedItem);
                this.setBody('orderConsumed',servedItem);
                this.body('container').addChild(servedItem);

                // Move served dishes into customer mouth
                servedItem.registerAnimation('scale',{x:0.5,y:0.5},0.3);
                servedItem.registerAnimation('position',this.locationToPoint('seated'),0.7);
                servedItem.registerAnimation('scale',{x:0.01,y:0.01},0.3);
                servedItem.runAnimations(function(){
                    console.log('item consumed',servedItem);

                    self.removeBody('orderConsumed');

                    // Close customer mouth
                    customer.setFrame(1);

                    // Remove served dish from plate
                    self.apply('resolveItem',[item, callback]);
                });


            },

            resolveItem: function( item, callback ){
                console.log('resolveItem',item,callback);
                var self = this;

                // Remove served dishes from order bubble
                var match = self.bodiesWithTag(item)[0];
                self.setBody('orderServed',match);
                console.log('matched order',match);

                match.registerAnimation('scale',{x:0.01,y:0.01},0.3);
                match.runAnimations(function(){

                    console.log('item served',match);
                    // Remove served dish from plate
                    self.removeBody('orderServed');

                    if (callback) callback();
                    //callback();
                });
            },

            customerMakePayment: function( ){

                // Calculate total payment from dishes served

                // Create coins in front of customer


                // Move coins into center pot

            },

            customerExit: function( ){
                var customer = this.body('customer');
                var destination = this.location('entry');

                customer.setFrame(2);

                // TODO add delay for fade, after rotation

                customer.registerAnimation('alpha',0,1.25,{parallel:true});
                //customer.registerAnimation('rotation',Math.PI,0.4, {parallel:true});
                customer.rotate( Math.PI, 0.4);
                customer.place( destination[0], destination[1], 1);
            }
        });
    }
});