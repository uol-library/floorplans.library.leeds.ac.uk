/**
 * Trawls through the GeoJSON files for features in all libraries and builds
 * a data structure for Classmarks used in routing from Primo requests
 */
import fs from 'fs';
import path from 'path';
const __dirname = import.meta.dirname;

const featuresJSON = fs.readdirSync( path.resolve( __dirname, '../assets/features' ), { encoding: 'utf8' } );
var classmarks = [];
featuresJSON.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename.endsWith( '.json' ) ) {
        let data = fs.readFileSync( path.resolve( __dirname, '../assets/features/', filename ) );
        let jsondata = JSON.parse( data );
        jsondata.features.forEach( feature => {
            let featureid = path.parse( filename ).name + '-' + feature.id;
            if ( feature.properties.type === 'shelf' ) {
                classmarks.push( [ feature.properties.name, featureid ] );
            }
        });
    }
});
var featuresJS = "floorplans.featureMap = " + JSON.stringify( classmarks.reverse() ) + ";";
fs.writeFileSync( path.resolve( __dirname, '../_includes/javascript/features.js' ), featuresJS );
