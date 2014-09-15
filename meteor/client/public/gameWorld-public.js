/**
 * Created by michaelgarrido on 9/15/14.
 */
bindPublicClientMethods = function(){
    console.log('bindPublicClientMethods');

    gameWorld.methods({
        setupDefaultWorld: function(){
            console.log('setupDefaultWorld',this);
            var self = this;

            config = Session.get('gameState_configuration');

            // Set global background colors
            this.view.contexts['mainContext'].setBackgroundColor(config.palette.brightOrange);


            // Table & Seats
            table = this.view.factory.makeBody2D( 'mainContext', 'table',
                this.view.locations.center(), { variant: 'public' } );


            // Customers
            seatedPositions = PRIZM.Layout.positionsAlongRadius( this.view.locations.center(), 440,
                [0, Math.PI/4, Math.PI/2, Math.PI/4*3, Math.PI,
                        Math.PI/4*5, Math.PI/4*6, Math.PI/4*7]);


            _.each( seatedPositions, function( position ){

                var lane = new CustomerLane();
                lane.init(position[0], position[1], position[2], self);

                self.addNode(lane);
            });

            lanes = this.nodesWithTag('customerLane');
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
        }
    });

};