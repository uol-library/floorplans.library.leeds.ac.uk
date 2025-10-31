const fs = require('fs');
const path = require('path');

var features = {};
const manifests = fs.readdirSync( path.resolve( __dirname, '../assets/iiif/cropped' ), { encoding: 'utf8' } );
manifests.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        features[filename] = {};
        let manifestData = fs.readFileSync( path.resolve( __dirname, '../assets/iiif/cropped', filename, 'manifest.json' ) );
        let manifestJSON = JSON.parse(manifestData);
        manifestJSON.items[0].annotations[0].items.forEach( shelf => {
            let key = shelf.body.value.replace(/[ ,]+/g, '-').toLowerCase();
            if ( features[filename].hasOwnProperty(key) ) {
                features[filename][key].points.push( getPointData( shelf.target.selector.value ) );
            } else {
                features[filename][key] = {
                    'label': shelf.body.value,
                    'points': [getPointData( shelf.target.selector.value )]
                };
            }
        });
    }
});

function getPointData( svgString ) {
    let points = [];
    let pointsRE = /.*points='([^']+).*/;
    let pointsStr = svgString.match( pointsRE )[1];
    let pointStrings = pointsStr.split(' ');
    pointStrings.forEach( pointString => {
        points.push(pointString.split(','));
    });
    return points;
}
fs.writeFileSync( path.resolve( __dirname, '../_data/allFeaturesPoints.json'), JSON.stringify( features, null, 4 ) );
