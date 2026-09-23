const fs = require('fs');
const path = require('path');
const features = fs.readdirSync( path.resolve( __dirname, '../assets/features' ), { encoding: 'utf8' } );
features.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename.endsWith('.json') ) {
        let featureData = fs.readFileSync( path.resolve( __dirname, '../assets/features', filename ) );
        let featureJSON = JSON.parse(featureData);
        let featureIDs = [];
        featureJSON.features.forEach( f => {
            if ( featureIDs.includes(f.id) ) {
                console.log("Duplicate ID: " + f.id);
            } else {
                featureIDs.push(f.id);
            }
            ["name", "type", "class"].forEach( prop => {
                if ( ! Object.hasOwn(f.properties, prop) || f.properties[prop] === "" ) {
                    console.log("Missing property: " + prop + " in feature: " + f.id);
                }
            });

        });
    }
});
