/**
 * Created by michaelgarrido on 9/15/14.
 */
QueueNode = function (){
    PRIZM.Node.call(this);
    //Node.call(this);
};

QueueNode.prototype = Object.create(PRIZM.Node.prototype);

console.dir(QueueNode);

_.extend( QueueNode.prototype, {
    init: function (world) {
        var self = this;
        this.world = world;

        this.state['itemTypes'] = ['drink','veggie','meat','dessert'];

        this.state['queueTimes'] = {
            drink: 1,
            veggie: 2.5,
            meat: 5,
            dessert: 2
        };

        this.state['cooldownTimes'] = {
            drink: 0.5,
            veggie: 0.5,
            meat: 0.5,
            dessert: 0.5
        };

        this.state['queueSlots'] = [null,null,null,null,null];


        this.methods({

            queueItem: function (item) {

                // Get first empty queue slot
                // from left to right
                var emptySlotIndex = _.indexOf(this.state['queueSlots'],null);

                console.log('queueItem',emptySlotIndex,item);

                if (emptySlotIndex!==-1) {
                   this.apply('prepareItem', [item,emptySlotIndex]);
                    return true;
                } else {
                    return false;
                }
            },

            prepareItem: function (variant, slot) {
                var position = this.location('queue'+slot);

                console.log('prepareItem', variant, slot, position);

                this.state['queueSlots'][slot] = variant;
                console.log('queue slots',this.state['queueSlots']);

                var button =  this.world.view.factory.makeBody2D( 'mainContext', 'dish',
                    { x:position[0], y:position[1]},
                    { variant: variant, scale:0.01 } );
                button.addTags(['queueButton',variant]);
                button.state['itemType'] = variant;
                this.addBody(button);

                button.resize(0.5,0.5, 0.4);
            },

            itemReady: function (item, slot) {

            },

            loadItem: function (item) {

            }

        });



        // Finally render node
        this.render();
    },

    render: function( configuration ){
        var self = this;

        //TODO pass in layout configuration from browser screen size !!!

        // Dish order buttons
        orderButtonPositions = PRIZM.Layout.distributePositionsAcrossWidth(
            {x:this.world.view.width/2,y:this.world.view.height-60}, 4, 220 );

        _.each( orderButtonPositions, function(position, index){
            var variant = self.state['itemTypes'][index];
            var button =  self.world.view.factory.makeBody2D( 'mainContext', 'dish',
                { x:position[0], y:position[1]},
                { variant: variant, scale:0.5 } );
            button.addTags(['orderButton',variant]);
            button.state['itemType'] = variant;
            self.addBody(button);
        });


        // http://stackoverflow.com/questions/18645334/meteor-meteor-call-from-within-observe-callback-does-not-execute
        // https://github.com/meteor/meteor/issues/907
        setTimeout(function(){
            // Dish queue buttons
            Meteor.apply('curveAroundOrigin', [{x:self.world.view.width/2, y:110}, 240, 30, 5],
                { wait: true },
                function(error,result){
                    console.log('after curveAroundOrigin',error,result);

                    queueButtonPositions = result;
//                    queueButtonPositions = distributePositionsAcrossWidth(
//                        {x:self.view.width/2,y:80}, 5, 240 );

                    _.each( queueButtonPositions, function(position,index){
                        var slot =  self.world.view.factory.makeBody2D( 'mainContext', 'dishStatus',
                            { x:position.x, y:position.y },
                            { variant: 'cooking', scale:0.4 } );

                        self.setLocation('queue'+index,position.x,position.y);
                        slot.addTag('queueSlot');
                        self.addBody(slot);
                    });

                    //TODO cleanup timing for binding UI
                    self.bindUI();

                });

        },0);
    },

    bindUI: function(){
        var self = this;

        // Bind UI target for each order button

        var orderButtons = this.bodiesWithTag('orderButton');

        _.each( orderButtons, function(body){

            var bounds = body.getAbsoluteBounds({center:true});

            console.log('order button', body, bounds);

            var target = self.world.view.UI.addCircleTarget( bounds[0],bounds[1], Math.max(bounds[2],bounds[3])/2, 'mainContext');

            target.setBehavior( 'tap', null, null, function( event ){
                console.log('order button tap',event);

                // Show feedback
                //body.resize(0.6,0.6, 0.2);
                body.registerAnimation('scale',{x:0.35,y:0.35},0.2);
                body.resize(0.5,0.5, 0.3);

                self.call('queueItem',body.state['itemType']);
            });

            target.activate();
        });

        var queueButtons = self.bodiesWithTag('queueSlot');

        _.each( queueButtons, function(body){

            var bounds = body.getAbsoluteBounds();

            console.log('queue button', body, bounds);

            var target = self.world.view.UI.addBoxTarget( bounds[0],bounds[1],bounds[2],bounds[3], 'mainContext');
            target.setBehavior( 'tap', null, null, function( event ){
                console.log('box tap stop',event);
            });

            target.activate();
        });

    }
});