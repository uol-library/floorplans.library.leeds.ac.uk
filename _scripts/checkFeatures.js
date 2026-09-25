/**
 * Checks the GeoJSON features for all floors for duplicate IDs and missing properties
 */
import fs from 'fs';
import path from 'path';
const __dirname = import.meta.dirname;
const features = fs.readdirSync( path.resolve( __dirname, '../assets/features' ), { encoding: 'utf8' } );
features.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename.endsWith('.json') ) {
        let featureData = fs.readFileSync( path.resolve( __dirname, '../assets/features', filename ) );
        let featureJSON = JSON.parse(featureData);
        let featureIDs = [];
        featureJSON.features.forEach( f => {
            if ( featureIDs.includes(f.id) ) {
                console.log(filename + ": Duplicate ID: " + f.id);
            } else {
                featureIDs.push(f.id);
            }
            ["name", "type", "class"].forEach( prop => {
                if ( ! Object.hasOwn(f.properties, prop) || f.properties[prop] === "" ) {
                    console.log(filename + ": Missing property: " + prop + " in feature: " + f.id);
                }
            });

        });
    }
});
