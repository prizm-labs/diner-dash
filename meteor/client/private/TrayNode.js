/**
 * Created by michaelgarrido on 9/15/14.
 */
TrayNode = function (){
    PRIZM.Node.call(this);
    //Node.call(this);
};

//CustomerLane.prototype = Object.create(Node.prototype);
TrayNode.prototype = Object.create(PRIZM.Node.prototype);

console.dir(TrayNode);

_.extend( TrayNode.prototype, {
    init: function (world,playerIndex) {

        var self = this;

        this.addTag('trayNode');

        this.world = world;

        this.state['playerIndex'] = playerIndex;
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

        this.state['trayLoadout'] = [null,null,null,null,null];
        this.state['isServing'] = false;

        this.methods({

            loadItem: function( item ){

            },

            laneWon: function (direction) {
                console.log('laneWon',direction);

                var iconKey = 'activeIcon';

                // Icon for customer being served
                var activeIcon = self.world.view.factory.makeBody2D( 'mainContext', 'serveLocation',
                    this.location('plate'+direction), { variant:'valid', scale: 0.5, visible: false } );
                activeIcon.resize(0.01,0.01);
                activeIcon.show();
                activeIcon.resize(0.5,0.5,0.5);
                this.setBody(iconKey,activeIcon);

                // Cache player at lane to clear later
                this.state['lane'+direction] = iconKey;

                this.call('startServing'); // Disable lanes
            },

            laneLost: function (direction, playerIndex){
                var self = this;

                console.log('laneLost',direction, playerIndex);

                var iconKey = 'serving'+playerIndex;

                var avatarContainer = this.world.view.factory.makeGroup2D( 'mainContext',
                    this.location('plate'+direction), {visible:false});
                avatarContainer.resize(0.01,0.01);

                var avatar = self.world.view.factory.makeBody2D( 'mainContext', 'avatar',
                    {x:0,y:0}, { variant:playerIndex, scale: 0.2 } );
                avatarContainer.addChild(avatar);
                avatar.addMask('circle',0,0,35);


                avatarContainer.show();
                avatarContainer.resize(1,1,0.5);
                this.setBody(iconKey,avatarContainer);

                // Cache player at lane to clear later
                this.state['lane'+direction] = iconKey;
            },

            laneCleared: function (direction) {
                console.log('laneCleared',direction);
                var self = this;

                var iconKey = this.state['lane'+direction];

                if (iconKey) {

                    if (iconKey=='activeIcon') {
                        this.call('stopServing'); // Enable lanes
                    }

                    // Remove avatar
                    var servingIcon = this.body(iconKey);
                    servingIcon.resize(0.01,0.01,0.5, function(){
                        self.removeBody(iconKey);
                    });

                    this.state['lane'+direction] = null;
                }
            },

            startServing: function(){
                var self = this;

                this.state['isServing'] = true;

                var plates = this.bodiesWithTag('plate');

                _.each(plates,function(plate){
                    plate.resize(0.01,0.01,0.5,function(){
                        plate.hide();
                    })
                });

            },

            stopServing: function(){
                var self = this;

                this.state['isServing'] = false;

                var plates = this.bodiesWithTag('plate');

                _.each(plates,function(plate){
                    plate.show();
                    plate.resize(0.4,0.4,0.5);
                });

            },


            updatePlates: function(){
                for (var i=0;ui<plates.length;i++){

                    //this.updatePlate(i, status);
                }
            },

            updatePlate: function( index, status ){

                var plate = this.bodiesWithTag('plate')[index];
                console.log('updatePlate',plate, index, status);

                // Change sprite
                // Activate / Deactivate

                switch(status){

                    case 'empty':
                        plate.setFrame(1); // plate is empty
                        plate.hitArea.deactivate();
                        break;

                    case 'closed':
                        plate.setFrame(0); // plate is closed
                        plate.hitArea.deactivate();
                        break;

                    case 'open':
                        plate.setFrame(2); // plate is open
                        plate.hitArea.activate();
                        break;

                }
            },

            serveCustomer: function( direction ){
                console.log('serveCustomer',direction);

                // Broadcast loadout
                this.world.liveData.broadcast('servingCustomer',
                    [
                        direction,
                        this.state['trayLoadout'],
                        Session.get('client_id'),
                        this.state['playerIndex']
                    ]);



                //TODO deactivate serving to other customers
                //TODO show target customer serving in process

                // Get valid servings

                // Animate valid servings

                // Receive payment

            },

            removeItem: function( index ){

            }

        });

        // Internal events
        amplify.subscribe('updateTray', function(queue){
            console.log('received updateQueue',queue);
            self.state['trayLoadout'] = queue;
        });


        // Finally render node
        this.render();
    },

    render: function( configuration ){
        var self = this;

        //TODO pass in layout configuration from browser screen size !!!

        // Table & Seats
        table = this.world.view.factory.makeBody2D( 'mainContext', 'table',
            this.world.view.locations.center(), { variant: 'private', scale:0.5 } );

        platePositions = PRIZM.Layout.positionsAlongRadius(
            this.world.view.locations.center(), 130,
            [0, Math.PI/4, Math.PI/2, Math.PI/4*3, Math.PI,
                    Math.PI/4*5, Math.PI/4*6, Math.PI/4*7]);

        _.each(platePositions, function (position, index) {

            var plate = self.world.view.factory.makeBody2D( 'mainContext', 'seat',
                { x:position[0], y:position[1]},
                { currentFrame: 1, frames :true, scale:0.4, rotation: position[2] } );
            plate.addTag('plate');
            plate.state['directionIndex'] = index;

            self.setLocation('plate'+index,position[0],position[1]);
            self.addBody(plate);
        });

        // Player's Tray
        tray = this.world.view.factory.makeBody2D( 'mainContext', 'tray',
            this.world.view.locations.center(), { scale:0.6 } );

        trayPositions = PRIZM.Layout.positionsAlongRadius(
            this.world.view.locations.center(), 70,
            [0, Math.PI*2/5, Math.PI*4/5, Math.PI*6/5, Math.PI*8/5 ]);

        _.each( trayPositions, function( position ){
            var slot = self.world.view.factory.makeBody2D( 'mainContext', 'dishStatus',
                { x:position[0], y:position[1]},
                { variant: 'cooking', scale:0.4 } );
            slot.addTag('traySlot');
        });

        // TODO map current user to player & avatar
        avatar = self.world.view.factory.makeBody2D( 'mainContext', 'avatar',
            self.world.view.locations.center(), { variant:self.state['playerIndex'], scale: 0.3 } );

        avatar.addMask('circle',0,0,60);
//        self.world.view.contexts['mainContext'].maskBody( avatar.entity(),
//            { shape:'circle', position:self.world.view.locations.center(), size:60 } );

        //TODO cleanup timing for binding UI
        self.bindUI();

    },

    bindUI: function(){
        var self = this;

        var plates = self.bodiesWithTag('plate');

        _.each( plates, function(body){

            var bounds = body.getAbsoluteBounds({center:true});

            console.log('plate button', body._entity, bounds);

            // Enlarge hit area for mobile screen usability
            var scaling = 1.5;
            bounds[2] = bounds[2]*scaling;
            bounds[3] = bounds[3]*scaling;

            var target = self.world.view.UI.addCircleTarget( bounds[0],bounds[1], Math.max(bounds[2],bounds[3])/2, 'mainContext');

            //boxTgt = self.world.view.UI.addBoxTarget( bounds[0],bounds[1],bounds[2],bounds[3], 'mainContext');
            target.setBehavior( 'tap', null, null, function( event ){
                console.log('plate direction tap',event);

                if (!self.state['isServing']) {
                    body.registerAnimation('scale',{x:0.3,y:0.3},0.15);
                    body.resize(0.4,0.4, 0.2);

                    self.call('serveCustomer',body.state['directionIndex']);
                }
            });

            body.setHitArea(target);
            //body.hitArea.activate();
        });

        // Bind UI for pan over tray
        //        boxTgt = uiManager.addBoxTarget(0,0,self.world.view.width,self.world.view.height,'mainContext');
//        boxTgt.setBehavior( 'tap', null, null, function( event ){
//            console.log('box tap stop',event);
//        });
//        boxTgt.setBehavior( 'pan',
//            function( event ){
//                console.log('box pan start',event);
//            },
//            function( event ){
//                console.log('box pan update',event);
//                //b1.place( event.center.x, event.center.y, 0 );
//                //b1.place( b1.x+event.deltaX, b1.y+event.deltaY );
//            },
//            function( event ){
//                console.log('box pan stop',event);
//            });
//
//        boxTgt.activate();

    }
});