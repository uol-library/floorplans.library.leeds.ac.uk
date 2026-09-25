/**
 * Tests for sending Primo links to the floorplans on the library website, which
 * show the app in an iframe (redirectPrimoLink in assets/js/modules/routing.mjs)
 */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { floorplans } from '../assets/js/modules/config.mjs';
import { getStartParams, redirectPrimoLink } from '../assets/js/modules/routing.mjs';
import { setLocation, readFixture } from './helpers.mjs';

const librarySite = 'https://library.leeds.ac.uk/locations/libraries';

/* where a URL redirects to (or undefined) */
function redirectFor( url, options ) {
    let win = setLocation( url, options );
    let redirected = redirectPrimoLink();
    assert.equal( redirected, win.redirected !== undefined );
    return win.redirected;
}

/**
 * The URL the library website puts in its iframe for one of its floorplan URLs -
 * the website builds it on its server, e.g. ?floor=w2&classmark=... gives
 * https://floorplans.library.leeds.ac.uk/brotherton/floors/w2?classmark=...
 */
function libraryIframeURL( url ) {
    let u = new URL( url );
    let paths = { brotherton: 'brotherton', 'edward-boyle': 'edwardboyle', 'health-sciences': 'healthsciences', laidlaw: 'laidlaw' };
    let path = '/' + paths[ u.pathname.split( '/' ).pop() ] + '/floors/';
    let floor = u.searchParams.get( 'floor' );
    let classmark = u.searchParams.get( 'classmark' );
    return path + ( floor || '' ) + ( classmark ? '?classmark=' + encodeURIComponent( classmark ) : '' );
}

describe( 'redirectPrimoLink', () => {
    beforeEach( () => {
        floorplans.conf.redirectPrimoLinks = true;
    });
    afterEach( () => {
        floorplans.conf.redirectPrimoLinks = false;
    });

    it( 'sends Primo links to the library website (as floorplans-broker.php did)', () => {
        assert.equal(
            redirectFor( '/floorplan?library=BL&classmark=Theatre+Q-11+LYN%2FC&floor=blw2' ),
            librarySite + '/brotherton?floor=w2&classmark=Theatre%20Q-11%20LYN/C#floorplans-brotherton'
        );
        assert.equal(
            redirectFor( '/floorplan?library=EBL&classmark=Management+V-58.64+SAS&floor=ebl12' ),
            librarySite + '/edward-boyle?floor=12&classmark=Management%20V-58.64%20SAS#floorplans-edward-boyle'
        );
    });
    it( 'uses an empty floor for Health Sciences', () => {
        assert.equal(
            redirectFor( '/floorplan?library=HSL&classmark=Health+Sciences+WS+350+GOW&floor=mdl' ),
            librarySite + '/health-sciences?floor=&classmark=Health%20Sciences%20WS%20350%20GOW#floorplans-health-sciences'
        );
    });
    it( 'uses the floor of the shelf when stock has moved', () => {
        assert.equal(
            redirectFor( '/floorplan?library=LL&classmark=Sociology+A-2+ALV&floor=ll1' ),
            librarySite + '/laidlaw?floor=third&classmark=Sociology%20A-2%20ALV#floorplans-laidlaw'
        );
    });
    it( 'keeps the floor when there is no classmark', () => {
        assert.equal( redirectFor( '/floorplan?library=BL&floor=blm3' ), librarySite + '/brotherton?floor=m3#floorplans-brotherton' );
    });
    it( 'sends unknown libraries to the list of libraries', () => {
        assert.equal( redirectFor( '/floorplan?library=SPCOLL&classmark=Special+Collections+Newspapers+JOU&floor=blspc' ), librarySite );
    });
    it( 'does not redirect in an iframe, so the library website can show the app', () => {
        assert.equal( redirectFor( '/floorplan?library=BL&floor=blm3', { embedded: true } ), undefined );
    });
    it( 'does not redirect other URLs', () => {
        for ( let url of [ '/', '/brotherton/m2/Philosophy', '/brotherton/floors/m3/' ] ) {
            assert.equal( redirectFor( url ), undefined, url );
        }
    });
    it( 'does not redirect when redirect_primo_links is off', () => {
        floorplans.conf.redirectPrimoLinks = false;
        assert.equal( redirectFor( '/floorplan?library=BL&floor=blm3' ), undefined );
    });
    it( 'shows the same shelf through the library website as the link does directly (all Primo links from the logs)', () => {
        for ( let link of readFixture( 'primo-links.txt' ) ) {
            setLocation( link );
            let direct = getStartParams();
            let target = redirectFor( link );
            if ( target === librarySite ) {
                continue;
            }
            setLocation( libraryIframeURL( target ) );
            let viaLibrary = getStartParams();
            assert.equal( viaLibrary.floorid, direct.floorid, link );
            assert.equal( viaLibrary.shelfid, direct.shelfid, link );
        }
    });
});
