/**
 * Created by michaelgarrido on 9/15/14.
 */
QueueNode = function (){
    PRIZM.Node.call(this);
    //Node.call(this);
};

//CustomerLane.prototype = Object.create(Node.prototype);
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


        //TODO pass in layout confguration from browser screen size !!!

        // Dish order buttons
        orderButtonPositions = PRIZM.Layout.distributePositionsAcrossWidth(
            {x:this.world.view.width/2,y:this.world.view.height-60}, 4, 220 );

        _.each( orderButtonPositions, function(position, index){
            var variant = self.state['itemTypes'][index];
            var button =  self.world.view.factory.makeBody2D( 'mainContext', 'dish',
                { x:position[0], y:position[1]},
                { variant: variant, scale:0.5 } );
            button.addTags(['orderButton',variant]);
            self.addBody(button);
        });

        uiManager = new PRIZM.UIManager( self.world.view.factory, 'hit-area' );
        uiManager.bindStageTarget('mainContext');

        // Bind UI target for each order button

        var orderButtons = this.bodiesWithTag('orderButton');

        _.each( orderButtons, function(body){

            var bounds = body.getAbsoluteBounds();

            console.log('order button', body, bounds);

            boxTgt = uiManager.addBoxTarget( bounds[0],bounds[1],bounds[2],bounds[3], 'mainContext');
            boxTgt.setBehavior( 'tap', null, null, function( event ){
                console.log('box tap stop',event);
            });

            boxTgt.activate();
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

                        self.setLocation('queue'+index,position)
                        slot.addTags(['queueButton','queueSlot']);
                        self.addBody(slot);
                    });

                    var queueButtons = self.bodiesWithTag('queueButton');

                    _.each( queueButtons, function(body){

                        var bounds = body.getAbsoluteBounds();

                        console.log('queue button', body, bounds);

                        boxTgt = uiManager.addBoxTarget( bounds[0],bounds[1],bounds[2],bounds[3], 'mainContext');
                        boxTgt.setBehavior( 'tap', null, null, function( event ){
                            console.log('box tap stop',event);
                        });

                        boxTgt.activate();
                    });

                });

        },0);


        this.methods({

            queueItem: function( item ){

            },

            itemReady: function( item ){

            },

            loadItem: function( item ){

            }

        });

    }

    //
});