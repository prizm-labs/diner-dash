/**
 * Created by michaelgarrido on 9/6/14.
 */

// Seed lobbies


// Seed games


// Seed users


seedCollection( Lobbies, 'seed', 'lobbies' );
seedCollection( Games, 'seed', 'games' );
seedCollection( Arenas, 'seed', 'arenas', function(doc){
    var lobby = Lobbies.findOne({title:'USC Startup Equinox'});
    doc.lobby_id = lobby._id;
    return doc;
} );

function seedCollection( collection, seedFile, seedObject, iterator ){

    if ( collection.find().count() === 0 ){
        console.log('seeding collection',seedObject);

        var documents = JSON.parse(Assets.getText(seedFile+'.json'))[seedObject];

        _.each( documents, function( doc ){

            if (iterator){
                doc = iterator(doc);
            }

            collection.insert(doc);
        });
    }

}