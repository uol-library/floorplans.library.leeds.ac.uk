/**
 * Helpers for the tests - browser globals (window, document, history and
 * localStorage) are replaced with small fakes, as the tests run in Node
 */
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve( import.meta.dirname, '..' );

/**
 * Sets up window.location (and window.history) for a URL, as the app would see it
 *
 * @param {String} url - path and query, or a full URL
 * @param {Object} options
 * @param {Boolean} options.embedded - whether the app is in an iframe
 * @returns {Object} the fake window - window.redirected is set by location.replace(),
 * and window.historyCalls records calls to pushState() and replaceState()
 */
export function setLocation( url, { embedded = false } = {} ) {
    let u = new URL( url, 'https://floorplans.library.leeds.ac.uk' );
    let win = new EventTarget();
    win.location = {
        href: u.href,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        replace: target => { win.redirected = target; }
    };
    win.historyCalls = [];
    let record = type => ( state, title, target ) => {
        win.historyCalls.push( { type, state, url: target } );
        let n = new URL( target, u );
        win.location.pathname = n.pathname;
        win.location.search = n.search;
        win.location.href = n.href;
    };
    win.history = { pushState: record( 'push' ), replaceState: record( 'replace' ) };
    win.self = win;
    win.top = embedded ? {} : win;
    globalThis.window = win;
    globalThis.history = win.history;
    globalThis.document = new EventTarget();
    return win;
}

/**
 * A minimal in-memory localStorage
 */
export class FakeStorage {
    constructor( items = {} ) {
        this.items = new Map( Object.entries( items ) );
    }
    get length() {
        return this.items.size;
    }
    key( i ) {
        return [ ...this.items.keys() ][ i ] ?? null;
    }
    getItem( key ) {
        return this.items.has( key ) ? this.items.get( key ) : null;
    }
    setItem( key, value ) {
        this.items.set( key, String( value ) );
    }
    removeItem( key ) {
        this.items.delete( key );
    }
    keys() {
        return [ ...this.items.keys() ];
    }
}

/**
 * Lines of a text fixture in tests/fixtures
 */
export function readFixture( name ) {
    return fs.readFileSync( path.join( root, 'tests/fixtures', name ), 'utf8' ).split( '\n' ).map( l => l.trim() ).filter( l => l && ! l.startsWith( '#' ) );
}
