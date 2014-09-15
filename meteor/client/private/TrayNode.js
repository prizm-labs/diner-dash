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


        // Table & Seats
        table = this.world.view.factory.makeBody2D( 'mainContext', 'table',
            this.world.view.locations.center(), { variant: 'private', scale:0.5 } );

        seatPositions = PRIZM.Layout.positionsAlongRadius( this.world.view.locations.center(), 130,
            [0, Math.PI/4, Math.PI/2, Math.PI/4*3, Math.PI,
                    Math.PI/4*5, Math.PI/4*6, Math.PI/4*7]);

        _.each(seatPositions, function( position ){
            var seat = self.world.view.factory.makeBody2D( 'mainContext', 'seat',
                { x:position[0], y:position[1]},
                { variant: 'neutral', scale:0.5, rotation: position[2] } );
        });


        // Player's Tray
        tray = this.world.view.factory.makeBody2D( 'mainContext', 'tray',
            this.world.view.locations.center(), { scale:0.6 } );

        trayPositions = PRIZM.Layout.positionsAlongRadius( this.world.view.locations.center(), 70,
            [0, Math.PI*2/5, Math.PI*4/5, Math.PI*6/5, Math.PI*8/5 ]);

        _.each( trayPositions, function( position ){
            var slot = self.world.view.factory.makeBody2D( 'mainContext', 'dishStatus',
                { x:position[0], y:position[1]},
                { variant: 'cooking', scale:0.4 } );
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


        this.methods({

            loadItem: function( item ){

            },

            updatePlate: function( index ){

            },

            serveCustomer: function( index ){

            },

            removeItem: function(){

            }

        });

    }

    //
});