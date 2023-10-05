const fs = require('fs');
const path = require('path');
const featuresJSON = fs.readdirSync( path.resolve( __dirname, '../assets/features' ), { encoding: 'utf8' } );
var classmarks = [];
featuresJSON.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let data = fs.readFileSync( path.resolve( __dirname, '../assets/features/', filename ) );
        let jsondata = JSON.parse( data );
        jsondata.features.forEach( feature => {
            let featureid = path.parse( filename ).name + '-' + feature.id;
            if ( feature.properties.type === 'shelf' ) {
                classmarks.push( [ feature.properties.name, featureid ] )
            }
        });
    }
});
var featuresJS = "function getFeatures() {\n    return " + JSON.stringify( classmarks.reverse() ) + ";\n};";
fs.writeFileSync( path.resolve( __dirname, '../_includes/javascript/features.js' ), featuresJS );
