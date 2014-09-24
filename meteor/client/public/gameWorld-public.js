/**
 * Created by michaelgarrido on 9/15/14.
 */
bindPublicClientMethods = function(){
    console.log('bindPublicClientMethods');

    gameWorld.methods({

        setupDefaultWorld: function(config){
            console.log('setupDefaultWorld',this);
            var self = this;

            // Set global background colors
            this.view.contexts['mainContext'].setBackgroundColor(config.palette.brightOrange);

            var center = this.view.locations.center();
            // TODO set game timers from config !!!

            // Timer: Game Over
            gameTimer = new PRIZM.Nodes.Timer();
            gameTimer.init(center.x, center.y, 'mainContext', self);
            gameTimer.renderPie(265,
                PRIZM.Colors.stringToHex(0xFFFFFF),
                PRIZM.Colors.stringToHex(config.palette.darkGray));
            gameTimer.configureInterval(30*1000,1000);


            gameTimer.configureEvents(

                function(progress,currentTime,delta){
                    console.log(progress,currentTime,delta);

                },

                function(){
                    console.log('complete!',this);
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
            countdownModal.prepare('none','none',
                function(){ // onRender
                    var self = this;

                    startTimer = new PRIZM.Nodes.Timer();
                    startTimer.init(0, 0, 'mainContext', countdownModal.world);

                    startTimer.configureInterval(3*1000,1000);
                    startTimer.renderNumber('seconds');

                    countdownModal.body('container').addChild(startTimer.body('container'));
                    countdownModal.addNode(startTimer);


                    startTimer.configureEvents(

                        function(progress,currentTime,delta){
                            console.log(progress,currentTime,delta);

                        },

                        function(){
                            console.log('complete!',this);

                            countdownModal.resign();
                        }
                    );
                },
                function(){ // onPresent
                    console.log('onPresent');
                    countdownModal.nodesWithTag('timer')[0].start();
                    //this.startTimer();
                },
                function(){ // onResign
                    console.log('onResign');
                    gameTimer.start();
                });
            countdownModal.present();

            // Timer: Start countdown


            // Timer: Refilling customers
        },

        welcomeCustomers: function(){
            var self = this;
            var lanes = this.nodesWithTag('customerLane');
            console.log('welcomeCustomers',lanes);

            _.each(lanes, function(lane){
                if (lane.state['customerPresent'] == false){
                    lane.call('customerEnter');
                }
            })
        },

        customersOrder: function(){
            var self = this;
            var lanes = this.nodesWithTag('customerLane');
            console.log('customersOrder',lanes);

            _.each(lanes, function(lane){
                if (lane.state['customerOrdered'] == false) {
                    var orders = self.call('generateRandomOrder');
                    lane.call('placeOrder',orders);
                }
            })
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