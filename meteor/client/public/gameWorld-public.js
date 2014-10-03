/**
 * Created by michaelgarrido on 9/15/14.
 */
bindPublicClientMethods = function(){
    console.log('bindPublicClientMethods');

    gameWorld.methods({

        resetWorld: function(){
            console.log('resetWorld',this);


        },

        checkServingInProgress: function(){
            var lanesBeingServed = _.filter(this.nodesWithTag('customerLane'),function(lane){
                return lane.call('isLocked');
            });

            console.log('checkServingInProgress',lanesBeingServed);

            return (lanesBeingServed.length>0)?lanesBeingServed:null;
        },

        reportScores: function(){

            var report = [];

            var scores = this.nodesWithTag('playerScore');

            _.each(scores,function(score){
                report.push(score.reportScore());
            });

            // scores in descending order
            report = _.sortBy(report,function(score){
                return -score.coins;
            });

            return report;
        },

        initiateEndGame: function(){
            console.log('initiateEndGame');
            var self = this;

            Meteor.setTimeout(function(){
                self.liveData.broadcast('servingComplete');
                gameOverModal.present();
            },2000);
        },

        setupDefaultWorld: function(config){
            console.log('setupDefaultWorld',this);
            var self = this;

            // Set global background colors
            this.view.contexts['mainContext'].setBackgroundColor(config.palette.brightOrange);

            var center = this.view.locations.center();

            // TODO set game timers from config !!!
            timers = {
                session: 15 //120
            };

            gameOverModal = new GameOverModal();
            gameOverModal.init(self.view.width,self.view.height,0.5,'#000000','mainContext',self);


            // Timer: Game Over
            gameTimer = new PRIZM.Nodes.Timer();
            gameTimer.init(center.x, center.y, 'mainContext', self);
            gameTimer.renderPie(265,
                PRIZM.Colors.stringToHex(0xFFFFFF),
                PRIZM.Colors.stringToHex(config.palette.darkGray));
            gameTimer.configureInterval(timers.session*1000,1000);


            gameTimer.configureEvents(

                function(){
                    console.log('gameTimer onStart');
                    gameWorld.liveData.broadcast('gameTimerStart');
                },

                function(progress,currentTime,delta){
                    console.log(progress,currentTime,delta);

                },

                function(){
                    console.log('complete!',this);

                    // Is serving in progress?
                    var servingInProgress = gameWorld.call('checkServingInProgress');

                    // Disable further serving from all players
                    gameWorld.liveData.broadcast('gameTimerEnd');


                    // Show game over modal
                    if (servingInProgress==null) {
                        gameWorld.call('initiateEndGame');
                    } else {

                        gameWorld.state['pendingEndGame'] = true;

                        // Cache playerIndex of lanes being served

                        gameWorld.state['lanesBeingServed'] = _.map(servingInProgress,function(lane) {
                            return lane.state['playerIndex'];
                        });
//                        var checkServingHandle = Meteor.setInterval(function(){
//                            console.log('check serving');
//                            if (!gameWorld.call('checkServingInpProgress')) {
//                                Meteor.clearInterval(checkServingHandle);
//
//                                gameWorld.call('initiateEndGame');
//                            }
//                        },1000);
                    }

                }
            );




            // Table & Seats
            table = this.view.factory.makeBody2D( 'mainContext', 'table',
                center, { variant: 'public' } );


            // Customers
            seatedPositions = PRIZM.Layout.positionsAlongRadius( this.view.locations.center(), 440,
                [0, Math.PI/4, Math.PI/2, Math.PI/4*3, Math.PI,
                        Math.PI/4*5, Math.PI/4*6, Math.PI/4*7]);


            _.each( seatedPositions, function( position, index ){

                var lane = new CustomerLane();
                lane.init(position[0], position[1], position[2], index, self);

                self.addNode(lane);
            });

            lanes = this.nodesWithTag('customerLane');


            // Scoreboard
            var players = config.gameState.players;
            var scoreBoard = {
                width: 800,
                origin: [self.view.width/2,200]
            };

            var scorePositions = PRIZM.Layout.distributePositionsAcrossWidth(
                scoreBoard.origin, players.length, scoreBoard.width
            );

            console.log('scoreboard positions',scorePositions);

            _.each( scorePositions, function(position,index) {
                var player = players[index];
                var playerScore = new PlayerScore();
                playerScore.init(position[0],position[1],self);
                playerScore.setPlayer(player.name,player.index);

                self.addNode(playerScore);
            });


            // Modal Views
            // Countdown
            countdownModal = new CountdownModal();
            countdownModal.init(self.view.width,self.view.height,0.5,'#000000','mainContext',self);
//            countdownModal.prepare('none','none',
//                function(){ // onRender
//                    var self = this;
//
//                    // Timer: Start countdown
//                    startTimer = new PRIZM.Nodes.Timer();
//                    startTimer.init(0, 0, 'mainContext', countdownModal.world);
//
//                    startTimer.configureInterval(3*1000,1000);
//                    startTimer.renderNumber('seconds');
//
//                    countdownModal.body('container').addChild(startTimer.body('container'));
//                    countdownModal.addNode(startTimer);
//
//
//                    startTimer.configureEvents(
//
//                        function(progress,currentTime,delta){
//                            console.log(progress,currentTime,delta);
//
//                        },
//
//                        function(){
//                            console.log('complete!',this);
//
//                            Meteor.setTimeout(function(){
//                                countdownModal.resign();
//                            },1000)
//
//                        }
//                    );
//                },
//                function(){ // onPresent
//                    console.log('onPresent');
//
//                    countdownModal.nodesWithTag('timer')[0].start();
//                    //this.startTimer();
//                },
//                function(){ // onResign
//                    console.log('onResign');
//                    gameTimer.start();
//                });
            countdownModal.linkGameTimer(gameTimer);
            countdownModal.present();

            // Start background music
            console.log('game sounds',self.sound);
            self.sound.sounds['background-normal'].loop().play().fadeIn();



            // Timer: Refilling customers
        },

        welcomeCustomers: function(callback){
            var self = this;
            var lanes = this.nodesWithTag('customerLane');
            console.log('welcomeCustomers',lanes);

            _.each(lanes, function(lane){
                if (lane.state['customerPresent'] == false){
                    lane.call('customerEnter');
                }
            });

            // TODO customer order as callback after seated !!!
            Meteor.setTimeout(function(){
                self.call('customersOrder',callback);
            }, 2000);
        },

        customersOrder: function(callback){
            var self = this;
            var lanes = this.nodesWithTag('customerLane');
            console.log('customersOrder',lanes);

            _.each(lanes, function(lane){
                if (lane.state['customerOrdered'] == false) {
                    var orders = self.call('generateRandomOrder');
                    lane.call('placeOrder',orders);
                }
            });

            if (callback) callback();

        },

        generateRandomOrder: function(){

            this.state['orderTypes'] = ['drink','veggie','meat','dessert'];
            this.state['orderLimit'] = 5;

            var result = [];
            var count = Math.floor(Math.random()*this.state['orderLimit'])+1;

            do {
                var index = Math.floor(Math.random()*this.state['orderTypes'].length);

                result.push(this.state['orderTypes'][index]);

                count--;
            } while (count>0);

            console.log('generateRandomOrder',result);

            return result;
        },

        startGame: function(){

            // Start game over timer


            // Start refilling timers

        },

        endGame: function(){
            // Allow current servings to finish


        },

        giveAwards: function(){


        }
    });

};