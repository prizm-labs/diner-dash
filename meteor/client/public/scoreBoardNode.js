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
        var self = this;

        this.world = world;

        this.addTag('playerScore');

        this.state['coinScore'] = 0;

        // Create object container and rotate to align with radius
        var container = this.world.view.factory.makeGroup2D('mainContext',
            { x: x, y: y });
        this.setBody('container', container);

        // Setup entry and exit locations for customer
        this.setLocation('avatarOrigin', 0, -40);
        this.setLocation('playerName', 0, 25);
        this.setLocation('coinIcon', -50, 75);
        this.setLocation('coinScore', -20, 75);

        // Internal events

        amplify.subscribe('orderPaid',function(args){
            // args: playerIndex,scoreDelta,direction
            if (args[0] == self.state['playerIndex'])
                self.updateScore(args[1],args[2]);
        });

//        amplify.subscribe('readyForScores',function(args){
//            self.reportScore();
//        });
    },

    reportScore: function(){
        // TODO update game state via Meteor method
        //amplify.publish('reportScore',[ this.state['playerIndex'],this.state['coinScore'] ]);
        //return [ this.state['playerIndex'],this.state['coinScore'] ];
        return {
            index:this.state['playerIndex'],
            coins:this.state['coinScore'],
            name:this.state['playerName']
        };
    },

    setPlayer: function (playerName, playerIndex) {

        this.addTag(playerIndex);

        this.state['playerIndex'] = playerIndex;
        this.state['playerName'] = playerName;

        this.render();
    },

    updateScore: function (scoreDelta, direction) {
        var self = this;

        console.log('updateScore',scoreDelta, direction);

        this.state['coinScore'] = this.state['coinScore']+scoreDelta;

        var customer = self.world.nodesWithTag('customerLane')[direction].body('container');
        console.log('customer paid',customer.x,customer.y,customer);

        // Create coins in front of customer
        var coins = [];
        do {
            var coin = self.world.view.factory.makeBody2D( 'mainContext', 'coin',
                [customer.x,customer.y],{ scale:0.01 } );
            //self.body('container').addChild(coin);
            coin.addTag('coin');
            coins.push(coin);
            self.addBody(coin);

            scoreDelta--;
        } while (scoreDelta>0);

        // Move coins around customer
        _.each(coins, function(coin){
            var target = PRIZM.Layout.randomPositionNear([customer.x,customer.y],100);
            console.log('random near customer',target.x, target.y);
            coin.registerAnimation('scale',{x:1,y:1},0.5,{parallel:true});
            coin.place(target.x, target.y, 0.8);
        });


        // Move coins to player score avatar
        Meteor.setTimeout(function(){

            var target = self.body('container');
            console.log('player score position',target.x, target.y);

            _.each(coins, function(coin){
                coin.registerAnimation('scale',{x:0.01,y:0.01},1, {parallel:true});
                coin.place(target.x, target.y, 1, function(){
                    self.removeBody(coin);
                });
            })

        },1200);


        // Pulse & update score number
        Meteor.setTimeout(function(){
            var coinScore = self.body('coinScore');

            coinScore.setText(self.state['coinScore']);
            coinScore.resize(1.5,1.5,0.3);
            coinScore.resize(1,1,0.6);

        },1800);
    },

    renderScore: function(){
        var self = this;

        var coinScore = self.world.view.factory.makeBody2D( 'mainContext',
            'text', self.location('coinScore'), { text:self.state['coinScore'],
                styles:{
                    font: 'normal 60px Helvetica',
                    fontSize:60
                }});
        //nameText.centerText();
        self.body('container').addChild(coinScore);
        self.setBody('coinScore',coinScore);
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

        this.renderScore();
    }


});