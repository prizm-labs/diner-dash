/**
 * Created by michaelgarrido on 9/6/14.
 */

// Seed lobbies


// Seed games


// Seed users


seedCollection( Lobbies, 'seed', 'lobbies' );
seedCollection( Games, 'seed', 'games' );


function seedCollection( collection, seedFile, seedObject ){

    if ( collection.find().count() === 0 ){
        console.log('seeding collection',seedObject);

        var documents = JSON.parse(Assets.getText(seedFile+'.json'))[seedObject];

        _.each( documents, function( doc ){
            collection.insert(doc);
        });
    }

}