/**
 * Created by michaelgarrido on 9/15/14.
 */
InfoTrayNode = function (){
    PRIZM.Node.call(this);
    //Node.call(this);
};

//CustomerLane.prototype = Object.create(Node.prototype);
InfoTrayNode.prototype = Object.create(PRIZM.Node.prototype);

console.dir(InfoTrayNode);

_.extend( InfoTrayNode.prototype, {
    init: function (world) {

        this,methods({});

    }

});