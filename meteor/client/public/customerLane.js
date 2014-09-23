/**
 * Created by michaelgarrido on 9/13/14.
 */
CustomerLane = function (){
    PRIZM.Node.call(this);
    //Node.call(this);
};

//CustomerLane.prototype = Object.create(Node.prototype);
CustomerLane.prototype = Object.create(PRIZM.Node.prototype);

console.dir(CustomerLane);

_.extend( CustomerLane.prototype, {
    init:  function( x, y, rotation, direction, world ){

        this.world = world;

        this.addTag('customerLane');

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
        this.setLocation('plateOrigin', 0,120);
        this.setLocation('avatarOrigin', 0,250);

        // Set lane's direction so it can be distinguished
        this.state['direction'] = direction;
        this.state['rotation'] = rotation;

        // What are total length of order bubbles per item count???
        this.state['orderWidths'] = [
            0, 80, 154, 230, 300
        ];
        this.state['payouts'] = {
            drink: 1,
            veggie: 3,
            meat: 6,
            dessert: 4
        };

        this.state['jackpotRatio'] = 0.5;

        this.state['customerPresent'] = false;
        this.state['currentClient'] = null; // Track which player is serving
        this.state['playerIndex'] = null;

        var avatarContainer = this.world.view.factory.makeGroup2D( 'mainContext',
            this.locationToPoint('avatarOrigin'), {visible:false});
        avatarContainer.rotate(-rotation);
        avatarContainer.resize(0.01,0.01);
        container.addChild(avatarContainer);
        this.setBody('avatarContainer', avatarContainer);

        var avatarBackground = this.world.view.factory.makeBody2D( 'mainContext', 'tray',
            {x:0,y:0}, { scale:0.6 } );
        this.setBody('avatarBackground', avatarBackground);
        avatarContainer.addChild(avatarBackground);

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
            { currentFrame: 1, frames :true } );
        container.addChild(plate);
        this.setBody('plate',plate);



        // Bind methods
        this.methods({

            isLocked: function(){
                return (this.state['currentClient']!=null);
            },

            customerEnter: function( ){
                var self = this;

                this.state['customerOrdered'] = false;
                this.state['customerTaken'] = true;
                this.state['customerPresent'] = true;
                var customer = this.body('customer');
                var destination = this.location('seated');

                customer.registerAnimation('rotation',0,0, {parallel:true});
                customer._entity.visible = true;
                customer.registerAnimation('alpha',1,0.5,{parallel:true});
                customer.registerAnimation('position', { x:destination[0], y:destination[1] }, 1);

                customer.runAnimations( function(){
                    customer.setFrame(1);
                    self.call('updatePlate','closed');
                });
            },

            generateOrderPositions: function( count ){
                var orderPositions = [];

                // generate positions for dish items
                if (count==1) {
                    orderPositions.push(this.location('orderItemOrigin'));
                } else {
                    orderPositions = Layout.distributePositionsAcrossWidth(
                        this.location('orderItemOrigin'), count, this.state['orderWidths'][count-1]);
                }

                return orderPositions;
            },

            placeOrder: function( orders ){
                // i.e. orders = ['veggie','meat','drink','veggie','dessert'];

                var self = this;

                this.state['customerOrdered'] = true;

                var orderBg = this.body('orderBg');
                orderBg.setFrame(orders.length-1);

                var orderPositions = this.call('generateOrderPositions', orders.length);

                // create hidden dish items
                _.each(orders, function(order, index){
                    var orderItem = self.world.view.factory.makeBody2D( 'mainContext', 'dish',
                        orderPositions[index],{ variant: order, scale:0.01 } );

                    //TODO add smaller item icons, since child sprites inherit scale from parent
                    orderItem.addTag(order);
                    orderItem.addTag('order');
                    // Rotata icon to align with global direction UP
                    orderItem.rotate(-self.state['rotation']);
                    self.setBody('order'+index,orderItem);
                    self.body('container').addChild(orderItem);
                });

                this.state['orders'] = orders;


                var goal = this.location('orderPlaced');
                orderBg._entity.visible = true;
                orderBg.registerAnimation('alpha',1,0.5,{parallel:true});
                orderBg.place( goal[0],goal[1], 1, function(){
                    self.call('revealOrder')
                });

            },

            revealOrder: function() {
                console.log('order placed');
                //TODO add smaller item icons, since child sprites inherit scale from parent

                for (var i=0;i<this.state['orders'].length;i++){
                    var orderItem = this.body('order'+i);
                    orderItem.registerAnimation('scale',{x:0.5,y:0.5},0.5);
                    orderItem.runAnimations();
                }

                this.call('updatePlate','open');
                console.log('order item', orderItem);
            },

            cancelOrder: function(){
                // Shrink all orders

                // Fade order bubble
            },

            serveOrder: function( servings, clientId, playerIndex ){
                var self = this;

                console.log('serveOrder',servings, clientId, playerIndex);

                //TODO show claiming player avatar

                var avatarContainer = this.body('avatarContainer');

                var avatar = self.world.view.factory.makeBody2D( 'mainContext', 'avatar',
                    {x:0,y:0}, { variant:playerIndex, scale: 0.35 } );


                avatarContainer.addChild(avatar);
                avatar.addMask('circle',0,0,60);
                avatarContainer.show();
                avatarContainer.resize(1,1,0.5);
                this.setBody('avatar',avatar);

                if (clientId){
                    this.state['currentClient'] = clientId;
                }
                this.state['playerIndex'] = playerIndex;

                // Lock customer
                this.call('updatePlate','closed');

                this.state['served'] = [];
                var servedCache = [];
                // Find servings matched to orders

                _.each(servings,function(item){

                    if (self.state['orders'].indexOf(item)!==-1) {
                        var match = self.state['orders'].splice(self.state['orders'].indexOf(item),1);
                        self.state['served'] = self.state['served'].concat(match);
                        servedCache = servedCache.concat(match);
                    }
                });

                console.log('items to serve',this.state['served'] );

                if (this.state['served'].length>0) {
                    this.call('consumeNextItem',function(){
                        console.log('all items served');
                        // Regenerate order bubble
                        console.log('orders after serving',self.state['orders']);

                        self.call('updateOrder');
                        self.call('makePayment',servedCache);

                    });
                } else {
                    // Release customer
                    this.call('updatePlate','open');
                }

            },

            updateOrder: function(){
                console.log('resetOrder');
                // Get remaining order bodies
                var orders = this.bodiesWithTag('order');
                var orderBubble = this.body('orderBg');

                if (orders.length>0) {
                    // Calculate new positions
                    var positions = this.call('generateOrderPositions', orders.length);

                    // Move to new positions
                    _.each( orders, function(body,index){
                        body.place( positions[index][0], positions[index][1], 0.2 );
                    });

                    // Resize background bubble
                    orderBubble.setFrame(orders.length-1);

                    // Release customer
                    this.call('updatePlate','open');

                } else {
                    orderBubble.fade(0,0.5);

                    // Customer leaves after order is complete
                    this.call('customerExit');
                }


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

            updatePlate: function( status ){
                console.log('updatePlate lane',status);

                switch(status){

                    case 'empty':
                        this.body('plate').setFrame(1); // plate is empty
                        this.state['customerTaken'] = true;
                        break;

                    case 'closed':
                        this.body('plate').setFrame(0); // plate is closed
                        this.state['customerTaken'] = true;
                        break;

                    case 'open':
                        this.body('plate').setFrame(2); // plate is open
                        this.state['customerTaken'] = false;
                        break;

                }

                //TODO broadcast status !!!
                this.world.liveData.broadcast('updatePlate',[this.state['direction'],status]);
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

                    // Remove dish from player who served it
                    self.world.liveData.broadcast('itemConsumed',[item,self.state['currentClient']]);

                    if (callback) callback();
                });
            },

            addToJackpot: function(payout) {
                var self = this;

                // Take percentage of payout
                payout = Math.max( Math.floor(payout*this.state['jackpotRatio']), 1);

                // Create coins in front of customer
                var coins = [];
                do {
                    var coin = self.world.view.factory.makeBody2D( 'mainContext', 'coin',
                        this.location('seated'),{ scale:0.01 } );
                    self.body('container').addChild(coin);
                    coin.addTag('coin');
                    coins.push(coin);

                    payout--;
                } while (payout>0);

                // Move coins into center pot
                _.each(coins, function(coin){
                    var target = PRIZM.Layout.randomPositionNear([0,400],120);
                    coin.registerAnimation('scale',{x:0.65,y:0.65},0.3);
                    coin.place(target.x, target.y, 1);
                })

            },

            makePayment: function( servedItems ){
                console.log('makPayment',servedItems);
                var self = this;
                var payout = 0;
                // Calculate total payment from dishes served
                _.each( servedItems, function(item){
                    payout+=self.state['payouts'][item];
                });

                console.log('payout',payout);

                this.call('addToJackpot',payout);

                // Remove player avatar
                var avatarContainer = this.body('avatarContainer');
                avatarContainer.resize(0.01,0.01,0.5,function(){
                    avatarContainer.hide();
                    self.removeBody('avatar');

                    // Update score
                    self.world.liveData.broadcast('orderPaid',
                        [
                            self.state['currentClient'],
                            self.state['playerIndex'],
                            payout,
                            servedItems,
                            self.state['direction']
                        ]);
                    amplify.publish('orderPaid',[
                        self.state['playerIndex'],
                        payout, self.state['direction']
                    ]);

                    // Finally, clear player data
                    self.state['currentClient'] = null;
                    self.state['playerIndex'] = null;
                });

            },

            customerExit: function( ){
                var self = this;
                var customer = this.body('customer');
                var destination = this.location('entry');

                // TODO broadcast customer empty
                this.call('updatePlate','empty');

                customer.setFrame(2); // customer walking

                customer.rotate( Math.PI, 0.4, function(){
                    customer.registerAnimation('alpha',0,0.7,{parallel:true});
                    //customer.registerAnimation('rotation',Math.PI,0.4, {parallel:true});
                    customer.place( destination[0], destination[1], 1, function(){
                        self.state['customerPresent'] = false;
                        console.log('customer left',self);
                    });
                });

            }
        });
    }
});