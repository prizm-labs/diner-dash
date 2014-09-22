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

        this.state['coinScore'] = 0;

        // Create object container and rotate to align with radius
        var container = this.world.view.factory.makeGroup2D('mainContext',
            { x: x, y: y });
        this.setBody('container', container);

        // Setup entry and exit locations for customer
        this.setLocation('avatarOrigin', 0, -15);
        this.setLocation('playerName', 0, 50);
        this.setLocation('coinIcon', -20, 100);
        this.setLocation('coinScore', 10, 100-32/2);
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

        var avatar = self.world.view.factory.makeBody2D( 'mainContext', 'avatar',
            self.location('avatarOrigin'), { variant:self.state['playerIndex'], scale: 0.3 } );

        self.body('container').addChild(avatar);
        self.setBody('avatar',avatar);
        avatar.addMask('circle',0,0,60);

        var nameText = self.world.view.factory.makeBody2D( 'mainContext',
            'text', self.location('playerName'), { text:self.state['playerName'],
                styles:{
                font: 'normal 16px Helvetica'
            }});
        nameText.centerText();
        self.body('container').addChild(nameText);
        self.setBody('nameText',nameText);


        var coinIcon = self.world.view.factory.makeBody2D( 'mainContext', 'coin',
            this.location('coinIcon'),{ scale:0.5 } );
        self.body('container').addChild(coinIcon);
        coinIcon.addTag('coinIcon');

        var coinScore = self.world.view.factory.makeBody2D( 'mainContext',
            'text', self.location('coinScore'), { text:self.state['coinScore'],
                styles:{
                    font: 'normal 32px Helvetica'
                }});
        //nameText.centerText();
        self.body('container').addChild(coinScore);
        self.setBody('coinScore',coinScore);
    }


});