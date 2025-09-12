import { parseAnnotation } from '@allmaps/annotation'
import { GcpTransformer } from '@allmaps/transform'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const __dirname = import.meta.dirname;

var pointData = readFileSync( path.resolve( __dirname, '../_data/allFeaturesPoints.json' ) );
var features = JSON.parse(pointData);
var featuremap = {
    'brotherton-m.json': ['brotherton-m1', 'brotherton-m2', 'brotherton-m3', 'brotherton-m4'],
    'edwardboyle.json': ['edwardboyle-8', 'edwardboyle-9', 'edwardboyle-10', 'edwardboyle-11', 'edwardboyle-12', 'edwardboyle-13'],
    'laidlaw.json': ['laidlaw-ground', 'laidlaw-first', 'laidlaw-second', 'laidlaw-third']
}
const manifests = readdirSync( path.resolve( __dirname, '../_data/annotations' ), { encoding: 'utf8' } );
manifests.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let featurekeys = featuremap[filename];
        let manifestData = readFileSync( path.resolve( __dirname, '../_data/annotations', filename ) );
        let manifestJSON = JSON.parse(manifestData);
        // Create a georeferencedMap from the annotation
        const georeferencedMaps = parseAnnotation(manifestJSON)
        const georeferencedMap = georeferencedMaps[0]
        // Build GCP Transformer
        const transformer = GcpTransformer.fromGeoreferencedMap(georeferencedMap)
        // Use it to transform geometries, as below. E.g.:
        featurekeys.forEach( featurekey => {
            if ( features.hasOwnProperty(featurekey) ) {
                for( let f in features[featurekey] ) {
                    features[featurekey][f].geoPoints = [];
                    features[featurekey][f].points.forEach( pointSet => {
                        let geoPointSet = [];
                        pointSet.forEach( point => {
                            let geoPoint = transformer.transformToGeo(point.map(v => parseFloat(v)));
                            geoPointSet.push(geoPoint);
                        });
                        features[featurekey][f].geoPoints.push(geoPointSet);
                    });
                }
            }
        });
    }
});
writeFileSync( path.resolve( __dirname, '../_data/allFeaturesGeo.json'), JSON.stringify( features, null, 4 ) );
