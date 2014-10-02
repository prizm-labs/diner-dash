/**
 * Created by michaelgarrido on 9/22/14.
 */
CountdownModal = function (){
    PRIZM.Nodes.Modal.call(this);
    this.super = PRIZM.Nodes.Modal.prototype;
};

CountdownModal.prototype = Object.create(PRIZM.Nodes.Modal.prototype);

console.dir(CountdownModal);

_.extend( CountdownModal.prototype, {

    init: function(width, height, backdropOpacity, backdropColor, ctx, world){

        var modal = this;

        this.super.init.call(this, width, height, backdropOpacity, backdropColor, ctx, world);

        this.prepare('none','none',
            function(){ // onRender
                var self = this;

                // Timer: Start countdown
                startTimer = new PRIZM.Nodes.Timer();
                startTimer.init(0, 0, 'mainContext', this.world);

                startTimer.configureInterval(3*1000,1000);
                startTimer.renderNumber('seconds');

                this.body('container').addChild(startTimer.body('container'));
                this.addNode(startTimer);


                startTimer.configureEvents(
                    function(){

                    },
                    function(progress,currentTime,delta){
                        console.log(progress,currentTime,delta);

                    },

                    function(){
                        console.log('complete!',this);

                        Meteor.setTimeout(function(){
                            self.resign();
                        },1000)

                    }
                );
            },
            function(){ // onPresent
                console.log('onPresent');

                this.nodesWithTag('timer')[0].start();
                //this.startTimer();
            },
            function(){ // onResign
                console.log('onResign');
                var self = this;

                this.world.call('welcomeCustomers',function(){
                    Meteor.setTimeout(function(){
                        self.state['gameTimer'].start();
                    },2000);
                });
            });
    },

    linkGameTimer: function(timer){
        console.log('linkGameTimer',timer);
        this.state['gameTimer'] = timer;
        //this.nodesWithTag('timer')[0].start();
    }

});




GameOverPrivateModal = function (){
    PRIZM.Nodes.Modal.call(this);
    this.super = PRIZM.Nodes.Modal.prototype;
};

GameOverPrivateModal.prototype = Object.create(PRIZM.Nodes.Modal.prototype);

console.dir(GameOverPrivateModal);

_.extend( GameOverPrivateModal.prototype, {

    init: function(width, height, backdropOpacity, backdropColor, ctx, world) {

        var self = this;

        this.super.init.call(this, width, height, backdropOpacity, backdropColor, ctx, world);


        this.setLocation('modalTitle', 0, -self.world.view.height / 2 + 100);

        this.prepare('none', 'none',
            function () { // onRender
                var self = this;

                var titleText = this.world.view.factory.makeBody2D(this.ctx,
                    'text', this.location('modalTitle'), { text: 'Game Over',
                        styles: {
                            font: 'normal 100px Helvetica',
                            fontSize: 100,
                            fill: 'white'
                        }});
                titleText.centerText();
                this.body('container').addChild(titleText);
                this.setBody('titleText', titleText);

            },
            function (options) { // onPresent
                console.log('onPresent');



            },
            function () { // onResign
                console.log('onResign');
//                this.state['gameTimer'].start();
            });

    }
});



GameOverModal = function (){
    PRIZM.Nodes.Modal.call(this);
    this.super = PRIZM.Nodes.Modal.prototype;
};

GameOverModal.prototype = Object.create(PRIZM.Nodes.Modal.prototype);

console.dir(GameOverModal);

_.extend( GameOverModal.prototype, {

    init: function(width, height, backdropOpacity, backdropColor, ctx, world){

        var self = this;

        this.super.init.call(this, width, height, backdropOpacity, backdropColor, ctx, world);


        this.setLocation('modalTitle', 0, -self.world.view.height/2+100);
        this.setLocation('avatarOrigin', 0, -self.world.view.height/4-100);
        this.setLocation('winnerTitle', 0, -self.world.view.height/4+135);
        this.setLocation('winnerSubtitle', 0, -self.world.view.height/4+250);




        this.prepare('none','none',
            function(){ // onRender
                var self = this;

                var titleText = this.world.view.factory.makeBody2D( this.ctx,
                    'text', this.location('modalTitle'), { text:'Game Over',
                        styles:{
                            font: 'normal 100px Helvetica',
                            fontSize: 100,
                            fill: 'white'
                        }});
                titleText.centerText();
                this.body('container').addChild(titleText);
                this.setBody('titleText',titleText);

            },
            function(){ // onPresent
                console.log('onPresent');

                // Calculate winner
                var finalScores = this.world.call('reportScores');
                this.showFinalScores(finalScores);
            },
            function(){ // onResign
                console.log('onResign');
//                this.state['gameTimer'].start();
            });


    },

    showFinalScores: function(scores){
        console.log('showFinalScores',scores,this);
        var self = this;

        var title, subtitle;

        if (scores.length>1 && scores[0].coins == scores[1].coins) {
            // Tie game
            title = 'It\'s a';
            subtitle = 'TIE!';

            self.world.liveData.broadcast('winnerDeclared',[null]);

        } else {
            // There is a winner]
            title = scores[0].name;
            subtitle = 'WINS!';

            self.world.liveData.broadcast('winnerDeclared',[scores[0].index]);

            var origin = this.location('avatarOrigin');

            // Create white background for player score bodies
            var avatarRadius = 150;
            var background = self.world.view.factory.makeShape2D( self.ctx, 'circle',
                origin, { radius:avatarRadius+30, fillColor:0xFFFFFF } );
            self.body('container').addChild(background);

            var avatar = self.world.view.factory.makeBody2D( this.ctx, 'avatar',
                origin, { variant:scores[0].index, scale: 0.75 } );

            self.body('container').addChild(avatar);
            self.setBody('avatar',avatar);
            avatar.addMask('circle',0,0,avatarRadius);
        }



        var winnerTitle = self.world.view.factory.makeBody2D( self.ctx,
            'text', this.location('winnerTitle'), { text:title,
                styles:{
                    font: 'normal 80px Helvetica',
                    fontSize: 80,
                    fill: 'white'
                }});
        winnerTitle.centerText();
        self.body('container').addChild(winnerTitle);
        self.setBody('winnerName',winnerTitle);

        var subtitleText = self.world.view.factory.makeBody2D( self.ctx,
            'text', this.location('winnerSubtitle'), { text:subtitle,
                styles:{
                    font: 'normal 200px Helvetica',
                    fontSize: 200,
                    fill: 'white'
                }});
        subtitleText.centerText();
        self.body('container').addChild(subtitleText);
        self.setBody('subtitleText',subtitleText);
        //this.setBody('titleText',titleText);


        var scorePositions = PRIZM.Layout.distributePositionsAcrossWidth(
            [0,0], scores.length, this.world.view.width/(2+(5-scores.length))
        );

        console.log('scorePositions',scorePositions);

        _.each(scorePositions,function(position,index){

            var score = scores[index];

            // Create white background for player score bodies
            var backgroundWidth = 175;
            var backgroundHeight = 275;
            var background = self.world.view.factory.makeShape2D( self.ctx, 'rectangle',
                [position[0]-backgroundWidth/2,position[1]-backgroundHeight/2],{ width:backgroundWidth, height:backgroundHeight, fillColor:0xFFFFFF } );
            self.body('container').addChild(background);

            // Move player score bodies' container into modal
            var scoreNode = self.world.nodesWithTags(['playerScore',score.index])[0];
            console.log('score',score,scoreNode);

            self.body('container').addChild(scoreNode.body('container'));
            scoreNode.body('container').place(position[0],position[1]);






//            var scoreText = self.world.view.factory.makeBody2D( self.ctx,
//                'text', position, { text:score.name+' '+score.coins,
//                    styles:{
//                        font: 'normal 80px Helvetica',
//                        fontSize: 80,
//                        fill: 'white'
//                    }});
//            scoreText.centerText();
//            self.body('container').addChild(scoreText);
//            self.addBody(scoreText);
//            //this.setBody('titleText',titleText);

        });
    }

});