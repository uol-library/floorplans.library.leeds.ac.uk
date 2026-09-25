/**
 * Tests that the Content-Security-Policy in .htaccess allows the inline import maps
 * (by their sha256 hash) and the scripts they load. If these fail after changing an
 * import map, update the hash in .htaccess to the one given in the error.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { root } from './helpers.mjs';

const htaccess = fs.readFileSync( path.join( root, '.htaccess' ), 'utf8' );
const policies = [ ...htaccess.matchAll( /Header set Content-Security-Policy "([^"]+)"/g ) ].map( m => m[1] );

function importMap( include ) {
    let html = fs.readFileSync( path.join( root, '_includes', include ), 'utf8' );
    let match = html.match( /<script type="importmap">([\s\S]*?)<\/script>/ );
    assert.ok( match, `no import map in ${include}` );
    return match[1];
}

function sha256( text ) {
    return 'sha256-' + crypto.createHash( 'sha256' ).update( text ).digest( 'base64' );
}

describe( 'Content-Security-Policy', () => {
    it( 'has a policy for the app, and one for the editor and IIIF pages', () => {
        assert.equal( policies.length, 2 );
    });

    for ( let [ include, policy, name ] of [ [ 'head.html', 0, 'app' ], [ 'editor-head.html', 1, 'editor and IIIF' ] ] ) {
        it( `allows the import map in ${include} in the ${name} policy`, () => {
            let map = importMap( include );
            let hash = sha256( map );
            assert.ok( policies[ policy ].includes( `'${hash}'` ), `the ${name} policy in .htaccess should include '${hash}'` );
            /* each script in the import map must be allowed by script-src */
            let scriptSrc = policies[ policy ].match( /script-src ([^;]+)/ )[1].split( /\s+/ );
            for ( let url of Object.values( JSON.parse( map ).imports ) ) {
                assert.ok( scriptSrc.some( src => src.startsWith( 'https://' ) && url.startsWith( src ) ), `${url} is not allowed by script-src` );
            }
        });
    }

    it( 'allows the library website to embed the app', () => {
        assert.match( policies[0], /frame-ancestors [^;]*https:\/\/library\.leeds\.ac\.uk/ );
    });
});
