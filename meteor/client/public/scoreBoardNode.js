/**
 * Created by michaelgarrido on 9/19/14.
 */
PlayerScore = function (){
    PRIZM.Node.call(this);
};

PlayerScore.prototype = Object.create(PRIZM.Node.prototype);

console.dir(PlayerScore);

_.extend( PlayerScore.prototype, {

    init:  function( x, y, world ) {

        this.world = world;

        this.addTag('playerScore');

        // Create object container and rotate to align with radius
        var container = this.world.view.factory.makeGroup2D('mainContext',
            { x: x, y: y });
        this.setBody('container', container);

        // Setup entry and exit locations for customer
        this.setLocation('avatarOrigin', 0, -100);
        this.setLocation('playerName', 0, 50);

    },

    setPlayer: function (playerName, playerIndex) {

        this.addTag(playerIndex);

        this.state['playerIndex'] = playerIndex;
        this.state['playerName'] = playerName;

        this.render();
    },

    updateScore: function (score) {

    },

    render: function() {
        var self = this;

        // TODO map current user to player & avatar
        var avatar = self.world.view.factory.makeBody2D( 'mainContext', 'avatar',
            self.location('avatarOrigin'), { variant:self.state['playerIndex'], scale: 0.3 } );

        self.world.view.contexts['mainContext'].maskBody( avatar.entity(),
            { shape:'circle', position:{x:0,y:0}, size:60 } );

        self.body('container').addChild(avatar);
        self.setBody('avatar',avatar);

        var nameText = self.world.view.contexts['mainContext'].addText(
            self.location('playerName'));

        self.body('container').addChild(nameText);
        self.setBody('nameText',nameText);
    }


});