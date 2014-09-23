/**
 * Created by michaelgarrido on 9/22/14.
 */
TimerNode = function (){
    PRIZM.Node.call(this);
};

TimerNode.prototype = Object.create(PRIZM.Node.prototype);

console.dir(TimerNode);

_.extend( TimerNode.prototype, {

    init: function (x, y, world) {

        this.state['currentTime'] = 0;
        this.state['active'] = false;

        this.world = world;
        var container = this.world.view.factory.makeGroup2D('mainContext',
            { x: x, y: y });
        this.setBody('container', container);
    },

    renderPie: function (radius, progressColor, backgroundColor) {
        var self = this;

        this.state['radius'] = radius;

        // Background B
        var backgroundB = this.createSemiCircle(radius+1,backgroundColor);
        this.setBody('backgroundB',backgroundB);
        this.body('container').addChild(backgroundB);
        backgroundB.rotate(Math.PI);

        // Progress A
        var progressA = this.createSemiCircle(radius,progressColor);
        this.setBody('progressA',progressA);
        this.body('container').addChild(progressA);
        progressA.rotate(Math.PI);

        // Progress B
        var progressB = this.createSemiCircle(radius,progressColor);
        this.setBody('progressB',progressB);
        this.body('container').addChild(progressB);

        // Background A
        var backgroundA = this.createSemiCircle(radius+1,backgroundColor);
        this.setBody('backgroundA',backgroundA);
        this.body('container').addChild(backgroundA);
        backgroundA.hide();
        backgroundA.rotate(Math.PI);

        // Pie mask
        var center = [this.body('container').x,this.body('container').y];
        var mask = self.world.view.factory.makeShape2D( 'mainContext', 'circle',
            center,{ radius:radius, fillColor:0xFFFFFF } );
        this.body('container').setMask(mask);
    },

    createSemiCircle: function (radius, fillColor) {
        var self = this;

        var container = this.world.view.factory.makeGroup2D('mainContext',
            [0,0]);

        var visibleArea =  self.world.view.factory.makeShape2D( 'mainContext', 'circle',
            [0,0],{ radius:radius, fillColor:fillColor } );
        container.addChild(visibleArea);

        var mask = self.world.view.factory.makeShape2D( 'mainContext', 'rectangle',
            [-radius,-radius],{ width:radius, height:radius*2, fillColor:0xFF0000 } );
        //container.addChild(mask);
        visibleArea.setMask(mask);

        return container;
    },

    configureInterval: function(maximum, delta){
        this.state['maxTime'] = maximum;
        this.state['delta'] = delta;
    },

    configureEvents: function (onProgress, onComplete) {

        this.state['onProgress'] = onProgress.bind(this);
        this.state['onComplete'] = onComplete.bind(this);
    },

    start: function(){

        var self = this;

        if (this.state['active']) return;

        this.state['active'] = true;

        //var rotation = Math.PI+progress*(Math.PI);
        this.body('progressA').rotate(2*Math.PI,this.state['maxTime']/2/1000, function(){

            // At halfway point
            // Hide progress A

            //Meteor.setTimeout(function(){
            self.body('progressA').hide();
            self.body('progressA').rotate(0);

            self.body('backgroundA').show();
            self.body('backgroundA').rotate(2*Math.PI,self.state['maxTime']/2/1000, function(){

                console.log('animation complete!');
                //self.reset();

            });
            //},self.state['maxTime']/2);

        });

        //self.onProgress();

        this.state['intervalHandle'] = Meteor.setInterval(function(){
            self.onProgress();
        },this.state['delta']);

    },

    onProgress: function(){

        this.state['currentTime'] += this.state['delta'];
        this.state['progress'] = this.state['currentTime']/this.state['maxTime'];

        this.state['onProgress'](this.state['progress'],this.state['currentTime'],this.state['delta']);

        if (this.state['currentTime'] == this.state['maxTime']) {
            this.onComplete();
        }
    },

    onComplete: function(){

        Meteor.clearInterval(this.state['intervalHandle']);

        //this.reset();

        console.log('internal onComplete',this);

        this.state['onComplete']();
    },

    reset: function(){

        // Reset state
        this.state['active'] = false;
        this.state['progress'] = 0;
        this.state['currentTime'] = 0;
        this.state['intervalHandle'] = null;


        // Reset bodies
        this.body('progressA').rotate(Math.PI);
        this.body('progressA').show();

        this.body('backgroundA').hide();
        this.body('backgroundA').rotate(0);
        this.body('backgroundA').rotate(Math.PI);

        console.log('internal reset',this);

    },

    onStart: function(){

    },

    centerRectangleOnCircle: function(radius){

    }

});