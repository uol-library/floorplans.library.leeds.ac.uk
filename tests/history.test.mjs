/**
 * Tests for keeping the URL and browser history in step with the floor, and the
 * back / forward buttons (initHistory in assets/js/modules/routing.mjs)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { floorplans } from '../assets/js/modules/config.mjs';
import { initHistory, getFloorURL } from '../assets/js/modules/routing.mjs';
import { setLocation } from './helpers.mjs';

/* fires the event dispatched by loadFloor() when a floor is shown */
function floorLoaded( floorid, shelfid = null ) {
    document.dispatchEvent( new CustomEvent( 'fpfloorloaded', { detail: { floor: { floorid }, layer: null, shelfid } } ) );
}

const philosophy = floorplans.featureMap.find( ( [ name, id ] ) => name === 'Philosophy' && id.startsWith( 'brotherton-m2-' ) );
const philosophyId = 'shelf' + philosophy[1].split( '-' ).pop();

describe( 'initHistory', () => {
    it( 'replaces the URL for the first floor loaded (e.g. a Primo link)', () => {
        let win = setLocation( '/floorplan?library=BL&floor=blm2&classmark=Philosophy+O-0.06+JAN' );
        initHistory( () => {} );
        floorLoaded( 'brotherton-m2', philosophyId );
        assert.deepEqual( win.historyCalls.map( c => [ c.type, c.url ] ), [ [ 'replace', '/brotherton/m2/Philosophy' ] ] );
        assert.deepEqual( win.historyCalls[0].state, { floorid: 'brotherton-m2', shelfid: philosophyId } );
    });

    it( 'adds a history entry when the floor changes', () => {
        let win = setLocation( '/' );
        initHistory( () => {} );
        floorLoaded( 'brotherton-m2' );
        floorLoaded( 'laidlaw-third' );
        floorLoaded( 'health-sciences' );
        assert.deepEqual( win.historyCalls.map( c => [ c.type, c.url ] ), [
            [ 'replace', '/brotherton/m2' ],
            [ 'push', '/laidlaw/third' ],
            [ 'push', '/healthsciences' ]
        ]);
    });

    it( 'replaces rather than adds an entry for the URL already shown (after back / forward)', () => {
        let win = setLocation( '/' );
        initHistory( () => {} );
        floorLoaded( 'brotherton-m2' );
        win.location.pathname = '/laidlaw/third';
        floorLoaded( 'laidlaw-third' );
        assert.equal( win.historyCalls[1].type, 'replace' );
    });

    it( 'only replaces the URL when embedded in an iframe', () => {
        let win = setLocation( '/brotherton/floors/m3/', { embedded: true } );
        initHistory( () => {} );
        floorLoaded( 'brotherton-m3' );
        floorLoaded( 'brotherton-m2' );
        assert.deepEqual( win.historyCalls.map( c => c.type ), [ 'replace', 'replace' ] );
    });

    it( 'loads the floor for the URL when the back or forward button is used', () => {
        let win = setLocation( '/' );
        let navigated = [];
        initHistory( params => navigated.push( params ) );
        win.location.pathname = '/brotherton/m2/Philosophy';
        win.dispatchEvent( new Event( 'popstate' ) );
        assert.equal( navigated.length, 1 );
        assert.equal( navigated[0].floorid, 'brotherton-m2' );
        assert.equal( navigated[0].shelfid, philosophyId );
    });

    it( 'does nothing on back / forward to a URL without a floor', () => {
        let win = setLocation( '/brotherton/m2' );
        let navigated = [];
        initHistory( params => navigated.push( params ) );
        win.location.pathname = '/';
        win.dispatchEvent( new Event( 'popstate' ) );
        assert.equal( navigated.length, 0 );
    });

    it( 'ignores floors which are not in the config', () => {
        let win = setLocation( '/' );
        initHistory( () => {} );
        floorLoaded( 'nowhere' );
        assert.equal( win.historyCalls.length, 0 );
        assert.equal( getFloorURL( 'nowhere' ), false );
    });
});
