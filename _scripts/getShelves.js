const fs = require('fs');
const path = require('path');

var classMapping = [
    {"d1": "d2"},
    {"d2": "d1"},
    {"d3": "d2"},
    {"d4": "d1"},
    {"d5": "d2"},
    {"d6": "d1"},
    {"d7": "d3"},
    {"d8": "d1"},
    {"d9": "d3"},
    {"d10": "d5"},
    {"d11": "d4"},
    {"d12": "d5"},
    {"d13": "d4"},
    {"d14": "d5"},
    {"d15": "d4"},
    {"d16": "d5"},
    {"d17": "d6"},
    {"d18": "d7"},
    {"d19": "d8"},
    {"d20": "d9"},
    {"d21": "d8"},
    {"d22": "d9"},
    {"d23": "d1"},
    {"d24": "d2"}
];
const features = fs.readdirSync( path.resolve( __dirname, '../assets/features/new' ), { encoding: 'utf8' } );
var shelves = {};
features.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename.endsWith('.json') ) {
        let featureData = fs.readFileSync( path.resolve( __dirname, '../assets/features/new', filename ) );
        let featureJSON = JSON.parse(featureData);
        shelves[filename] = [];
        featureJSON.features.forEach( f => {
            if ( f.properties.type === 'shelf' ) {
                shelves[filename].push(f.properties.class);
                //f.properties.class = classMapping.find( c => c[f.properties.class] )[f.properties.class];
            }
        });
        //fs.writeFileSync( path.resolve( __dirname, '../assets/features/new', filename ), JSON.stringify(featureJSON, null, 4) );
        console.log( filename, shelves[filename] );
    }
});

