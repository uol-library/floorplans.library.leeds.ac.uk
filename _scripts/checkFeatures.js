const fs = require('fs');
const path = require('path');
const features = fs.readdirSync( path.resolve( __dirname, '../assets/features' ), { encoding: 'utf8' } );
features.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename.endsWith('.json') ) {
        let featureData = fs.readFileSync( path.resolve( __dirname, '../assets/features', filename ) );
        let featureJSON = JSON.parse(featureData);
        let featureID = 1;
        featureJSON.features.forEach( f => {
            f.id = featureID++;
        });
        fs.writeFileSync( path.resolve( __dirname, '../assets/features', filename ), JSON.stringify(featureJSON, null, 4) );
    }
});
