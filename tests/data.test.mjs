/**
 * Tests for the floor data - the config, GeoJSON features, and the feature map
 * built from them by _scripts/writeFeatureMaps.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { floorplans } from '../assets/js/modules/config.mjs';
import { root } from './helpers.mjs';

const featuresDir = path.join( root, 'assets/features' );
const featureFiles = fs.readdirSync( featuresDir ).filter( f => f.endsWith( '.json' ) );
const floors = floorplans.libraries.flatMap( lib => lib.floors.map( floor => ({ lib, floor }) ) );
const readFeatures = file => JSON.parse( fs.readFileSync( path.join( featuresDir, file ), 'utf8' ) );

describe( 'Library config', () => {
    it( 'has unique library and floor IDs', () => {
        let libraryIds = floorplans.libraries.map( lib => lib.id );
        let floorIds = floors.map( f => f.floor.floorid );
        assert.equal( new Set( libraryIds ).size, libraryIds.length );
        assert.equal( new Set( floorIds ).size, floorIds.length );
    });
    it( 'has an image and a features file for each floor', () => {
        for ( let { floor } of floors ) {
            for ( let url of [ floor.imageurl, floor.dataurl ] ) {
                let file = path.join( root, url.replace( floorplans.imgconf.baseURL, '' ) );
                assert.ok( fs.existsSync( file ), `${floor.floorid}: ${file} is missing` );
            }
        }
    });
    it( 'names floors so app URLs work (floor IDs start with the library ID)', () => {
        for ( let { lib, floor } of floors ) {
            if ( lib.floors.length > 1 ) {
                assert.ok( floor.floorid.startsWith( lib.id + '-' ), floor.floorid );
            }
        }
    });
});

describe( 'GeoJSON features', () => {
    for ( let file of featureFiles ) {
        it( `${file} has unique IDs and the required properties`, () => {
            let ids = new Set();
            for ( let feature of readFeatures( file ).features ) {
                assert.ok( ! ids.has( feature.id ), `duplicate ID ${feature.id}` );
                ids.add( feature.id );
                for ( let prop of [ 'name', 'type', 'class' ] ) {
                    assert.ok( feature.properties[ prop ], `feature ${feature.id} has no ${prop}` );
                }
                assert.ok( [ 'area', 'shelf', 'service' ].includes( feature.properties.type ), `feature ${feature.id} has type ${feature.properties.type}` );
            }
        });
    }
});

describe( 'Feature map (_includes/javascript/features.js)', () => {
    it( 'is up to date with the GeoJSON (run npm run buildStatic if not)', () => {
        /* the same as _scripts/writeFeatureMaps.js */
        let expected = [];
        for ( let file of fs.readdirSync( featuresDir ) ) {
            if ( file.endsWith( '.json' ) ) {
                for ( let feature of readFeatures( file ).features ) {
                    if ( feature.properties.type === 'shelf' ) {
                        expected.push( [ feature.properties.name, path.parse( file ).name + '-' + feature.id ] );
                    }
                }
            }
        }
        assert.deepEqual( floorplans.featureMap, expected.reverse() );
    });
    it( 'has unique shelf IDs', () => {
        let ids = floorplans.featureMap.map( ( [ name, id ] ) => id );
        assert.equal( new Set( ids ).size, ids.length );
    });
    it( 'only has shelves on floors in the config', () => {
        let floorIds = new Set( floors.map( f => f.floor.floorid ) );
        for ( let [ name, id ] of floorplans.featureMap ) {
            assert.ok( floorIds.has( id.substring( 0, id.lastIndexOf( '-' ) ) ), `${name} (${id})` );
        }
    });
});
