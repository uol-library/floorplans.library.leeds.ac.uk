/**
 * Trawls through the GeoJSON files for features in all libraries and builds
 * a data structure for Classmarks used in routing from Primo requests
 */
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
                let hslcmre = /^(AVC|BF|BL|BM|GN|HM|HV|Q|QA|QB|QC|QD|QH|QL|QP|QS|QT|QU|QV|QW|QY|QZ|W|WA|WB|WC|WD|WE|WF|WG|WH|WI|WJ|WK|WL|WM|WN|WO|WP|WQ|WR|WS|WT|WU|WV|WW|WX|WY|WZ|Z) .*/;
                let hslcm = feature.properties.name.match( hslcmre );
                if ( hslcm !== null ) {
                    classmarks.push( [ hslcm[1], featureid])
                } else {
                    classmarks.push( [ feature.properties.name, featureid ] );
                }
            }
        });
    }
});
var featuresJS = "function getFeatures() {\n    return " + JSON.stringify( classmarks.reverse() ) + ";\n};";
fs.writeFileSync( path.resolve( __dirname, '../_includes/javascript/features.js' ), featuresJS );
