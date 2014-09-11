/**
 * Created by michaelgarrido on 9/9/14.
 */
gameWorld = new PRIZM.GameWorld();

//gameWorld = null;
//
//if (Session.get('gameWorld')) {
//    gameWorld = Session.get('gameWorld');
//} else {
//    console.log('new gameWorld');
//    gameWorld = new PRIZM.GameWorld();
//    Session.set('gameWorld',gameWorld);
//}

bindPrivateClientMethods = function( key, methods ){
    console.log('bindPrivateClientMethods');

    gameWorld.methods({
        setupDefaultWorld: function(){
            console.log('setupDefaultWorld',this);
            var self = this;

            // Table & Seats
            table = this.view.factory.makeBody2D( 'mainContext', 'table',
                this.view.locations.center(), { variant: 'private', scale:0.5 } );

            seatPositions = positionsAlongRadius( this.view.locations.center(), 130,
                [0, Math.PI/4, Math.PI/2, Math.PI/4*3, Math.PI,
                        Math.PI/4*5, Math.PI/4*6, Math.PI/4*7]);

            _.each(seatPositions, function( position ){
                var seat = self.view.factory.makeBody2D( 'mainContext', 'seat',
                    { x:position[0], y:position[1]},
                    { variant: 'neutral', scale:0.5, rotation: -position[2] } );
                    // reflect rotation across Y axis
            });


            // Player's Tray
            tray = this.view.factory.makeBody2D( 'mainContext', 'tray',
                this.view.locations.center(), { scale:0.6 } );

            trayPositions = positionsAlongRadius( this.view.locations.center(), 55,
                [0, Math.PI*2/5, Math.PI*4/5, Math.PI*6/5, Math.PI*8/5 ]);

            _.each( trayPositions, function( position ){
               var slot = self.view.factory.makeBody2D( 'mainContext', 'dish',
                   { x:position[0], y:position[1]},
                   { variant: 'veggie', scale:0.35 } );
            });


            // Dish order buttons
            orderButtonPositions = distributePositionsAcrossWidth(
                {x:self.view.width/2,y:self.view.height-60}, 4, 220 );

            _.each( orderButtonPositions, function(position){
               var button =  self.view.factory.makeBody2D( 'mainContext', 'dish',
                   { x:position[0], y:position[1]},
                   { variant: 'dessert', scale:0.5 } );

            });


            // Dish queue buttons
            Meteor.call('quadraticCurveAroundOrigin',[ self.view.width/2, 90 ], 240, 30, 5,
                function(error,result){
                    console.log('after quadraticCurveAroundOrigin',result);

                    queueButtonPositions = result;
//                    queueButtonPositions = distributePositionsAcrossWidth(
//                        {x:self.view.width/2,y:80}, 5, 240 );

                    _.each( queueButtonPositions, function(position){
                        var button =  self.view.factory.makeBody2D( 'mainContext', 'dish',
                            { x:position.x, y:position.y },
                            { variant: 'meat', scale:0.4 } );

                    });

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

            self.view.factory.loadTemplates2D('mainContext',avatarUrls,avatarManifest,function(){
                avatar = self.view.factory.makeBody2D( 'mainContext', 'avatar',
                     self.view.locations.center(), { variant:'p1', scale: 0.3 } );

                self.view.contexts['mainContext'].maskBody( avatar.entity(),
                    { shape:'circle', position:self.view.locations.center(), size:60 } );
            }, true);
        }
    });

}

bindPublicClientMethods = function(){
    console.log('bindPublicClientMethods');

    gameWorld.methods({
        setupDefaultWorld: function(){
            console.log('setupDefaultWorld',this);
            b1 = this.view.factory.makeBody2D( 'mainContext', 'table',
                this.view.locations.center(), { variant: 'public', scale:0.5 } );
        }
    });

}


Deps.autorun(function(){

    if (Session.get('client_type')){

        if (Session.get('client_type')==='private') {
            bindPrivateClientMethods();
        } else if (Session.get('client_type')==='public') {
            bindPublicClientMethods();
        }

    }

});

function positionsAlongRadius( origin, length, angles ){
    var positions = [];
    _.each(angles, function(angle){
       positions.push(positionAlongRadius(_.clone(origin), length, angle));
    });

    return positions;
}


function positionAlongRadius( origin, length, angle ){

    var x = Math.sin(angle)*length;
    var y = Math.cos(angle)*length;

    return [ origin.x+Math.round(x), origin.y+Math.round(y), angle ];
}

function distributePositionsAcrossWidth( origin, count, width ){

    var positions = [];
    for (var p=0; p<count; p++){
        positions.push([ origin.x+p*width/(count-1)-(width/2), origin.y ]);
    }

    return positions;
}