/**
 * Created by michaelgarrido on 9/11/14.
 */
//console.log('Shape import',Shape);
//
//var s = new Shape();
//s.steps = 5; //number of steps for our curves..
//
//s.moveTo(0, 0);
//s.quadraticCurveTo( 120,30, 240,0, 5 );
////s.lineTo(x3, y3);
//
//console.log(s.points);

Layout = {
    positionsAlongRadius: function( origin, length, angles ){
        var positions = [];
        _.each(angles, function(angle){
            positions.push(positionAlongRadius(_.clone(origin), length, angle));
        });

        return positions;
    },


    positionAlongRadius: function( origin, length, angle ){
        origin = this.arrayToPoint(origin);

        var x = Math.sin(angle)*length;
        var y = Math.cos(angle)*length;

        return [ origin.x+Math.round(x), origin.y-Math.round(y), angle ];
    },

    distributePositionsAcrossWidth: function( origin, count, width ){
        origin = this.arrayToPoint(origin);

        var positions = [];
        for (var p=0; p<count; p++){
            positions.push([ origin.x+p*width/(count-1)-(width/2), origin.y ]);
        }

        return positions;
    },
    arrayToPoint: function( data ){
        if (Array.isArray(data))
            return {x:data[0],y:data[1]}
        else
            return data
    }
}