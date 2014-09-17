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
    init: function (world) {

        var self = this;

        this.addTag('trayNode');

        this.world = world;

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

        this.methods({

            loadItem: function( item ){

            },

            updatePlates: function( plates ){
                var self = this;

                _.each(plates, function(plate){

                })
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
                this.world.liveData.broadcast('servingCustomer',[direction, this.state['trayLoadout']]);

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


        // https://graph.facebook.com/10203388818815570/picture?type=large&height=500&width=500
        // Player avatars
        var avatarUrls = ['https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/c32.113.402.402/197820_10200365622437550_1307454223_n.jpg?oh=8c158d69e3b36d07539b721b9cd0f404&oe=5492CF89&__gda__=1418764606_1684123b2a18eb8f4ab3bc3252c1e156',
            'https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg'];
        var avatarManifest = [
            [ 'avatar', {
                'p1':'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/c32.113.402.402/197820_10200365622437550_1307454223_n.jpg?oh=8c158d69e3b36d07539b721b9cd0f404&oe=5492CF89&__gda__=1418764606_1684123b2a18eb8f4ab3bc3252c1e156',
                'p2':'https://lh5.googleusercontent.com/-TbxFjAU9Vpg/AAAAAAAAAAI/AAAAAAAAAJU/ZiJRz12XYco/photo.jpg'}]
        ];

        self.world.view.factory.loadTemplates2D('mainContext',avatarUrls,avatarManifest,function(){
            avatar = self.world.view.factory.makeBody2D( 'mainContext', 'avatar',
                self.world.view.locations.center(), { variant:'p1', scale: 0.3 } );

            self.world.view.contexts['mainContext'].maskBody( avatar.entity(),
                { shape:'circle', position:self.world.view.locations.center(), size:60 } );
        }, true);


        //TODO cleanup timing for binding UI
        self.bindUI();

    },

    bindUI: function(){
        var self = this;

        var plates = self.bodiesWithTag('plate');

        _.each( plates, function(body){

            var bounds = body.getAbsoluteBounds({center:true});

            console.log('plate button', body._entity, bounds);

            var target = self.world.view.UI.addCircleTarget( bounds[0],bounds[1], Math.max(bounds[2],bounds[3])/2, 'mainContext');

            //boxTgt = self.world.view.UI.addBoxTarget( bounds[0],bounds[1],bounds[2],bounds[3], 'mainContext');
            target.setBehavior( 'tap', null, null, function( event ){
                console.log('plate direction tap',event);


                self.call('serveCustomer',body.state['directionIndex']);
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