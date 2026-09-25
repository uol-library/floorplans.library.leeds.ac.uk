/**
 * Tests for fetching and caching JSON data (getJSON and clearStorage in
 * assets/js/modules/utilities.mjs)
 */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { floorplans } from '../assets/js/modules/config.mjs';
import { FakeStorage, setLocation } from './helpers.mjs';

const prefix = 'floorplans-' + floorplans.version + '-';
const canUseLocalStorage = floorplans.canUseLocalStorage;
let fetched;
let imports = 0;

/**
 * Imports a fresh copy of utilities.mjs, as it checks for data from other
 * versions once, the first time getJSON() is called
 */
async function utilities() {
    return import( '../assets/js/modules/utilities.mjs?test=' + ( ++imports ) );
}

/* sets up localStorage, and fetch() to return the given responses by URL */
function setUp( storage = new FakeStorage(), responses = {} ) {
    setLocation( '/' );
    window.localStorage = storage;
    globalThis.localStorage = storage;
    fetched = [];
    globalThis.fetch = async url => {
        fetched.push( url );
        let r = responses[ url ] ?? { status: 200, body: JSON.stringify( { url } ) };
        if ( r.networkError ) {
            throw new TypeError( 'Failed to fetch' );
        }
        return { ok: r.status >= 200 && r.status < 300, status: r.status, statusText: r.statusText ?? '', text: async () => r.body };
    };
    return storage;
}

/* an item as stored by setWithExpiry() */
function cached( value, hours = 1 ) {
    return JSON.stringify( { value: JSON.stringify( value ), expiry: Date.now() + hours * 3600000 } );
}

describe( 'getJSON', () => {
    beforeEach( () => {
        floorplans.canUseLocalStorage = () => true;
    });
    afterEach( () => {
        floorplans.canUseLocalStorage = canUseLocalStorage;
    });

    it( 'fetches and parses JSON', async () => {
        setUp();
        let { getJSON } = await utilities();
        assert.deepEqual( await getJSON( { key: 'laidlaw-second', url: '/a.json' } ), { url: '/a.json' } );
        assert.deepEqual( fetched, [ '/a.json' ] );
    });

    it( 'caches data under a key prefixed with the site version', async () => {
        let storage = setUp();
        let { getJSON } = await utilities();
        await getJSON( { key: 'laidlaw-second', url: '/a.json' } );
        let item = JSON.parse( storage.getItem( prefix + 'laidlaw-second' ) );
        assert.equal( item.value, JSON.stringify( { url: '/a.json' } ) );
        assert.ok( item.expiry > Date.now() );
    });

    it( 'uses cached data until it expires', async () => {
        let storage = setUp();
        let { getJSON } = await utilities();
        await getJSON( { key: 'k', url: '/a.json' } );
        await getJSON( { key: 'k', url: '/a.json' } );
        assert.equal( fetched.length, 1 );
        storage.setItem( prefix + 'k', cached( { old: true }, -1 ) );
        await getJSON( { key: 'k', url: '/a.json' } );
        assert.equal( fetched.length, 2 );
    });

    it( 'fetches again if the cached data cannot be read', async () => {
        setUp( new FakeStorage( { [ prefix + 'k' ]: 'not json' } ) );
        let { getJSON } = await utilities();
        assert.deepEqual( await getJSON( { key: 'k', url: '/a.json' } ), { url: '/a.json' } );
        assert.equal( fetched.length, 1 );
    });

    it( 'removes data cached by other versions, and leaves other items alone', async () => {
        let storage = setUp( new FakeStorage( {
            'laidlaw-second': cached( { unprefixed: true } ),
            'floorplans-0.1-brotherton-m1': cached( { old: true } ),
            [ prefix + 'brotherton-m2' ]: cached( { current: true } ),
            'someOtherSetting': 'dark'
        } ) );
        let { getJSON } = await utilities();
        await getJSON( { key: 'k', url: '/a.json' } );
        assert.deepEqual( storage.keys().sort(), [ prefix + 'brotherton-m2', prefix + 'k', 'someOtherSetting' ].sort() );
    });

    it( 'does not use localStorage without consent (canUseLocalStorage)', async () => {
        floorplans.canUseLocalStorage = () => false;
        let storage = setUp( new FakeStorage( { 'laidlaw-second': cached( { unprefixed: true } ) } ) );
        let { getJSON } = await utilities();
        await getJSON( { key: 'k', url: '/a.json' } );
        await getJSON( { key: 'k', url: '/a.json' } );
        assert.equal( fetched.length, 2 );
        assert.deepEqual( storage.keys(), [ 'laidlaw-second' ] );
    });

    it( 'rejects without a key or URL', async () => {
        setUp();
        let { getJSON } = await utilities();
        await assert.rejects( getJSON( { url: '/a.json' } ), { status: 'Missing parameters' } );
        await assert.rejects( getJSON( { key: 'k' } ), { status: 'Missing parameters' } );
        assert.equal( fetched.length, 0 );
    });

    it( 'rejects with the status of a failed request, and does not cache it', async () => {
        let storage = setUp( undefined, { '/missing.json': { status: 404, statusText: 'Not Found' } } );
        let { getJSON } = await utilities();
        await assert.rejects( getJSON( { key: 'k', url: '/missing.json' } ), { status: 404, statusText: 'Not Found' } );
        assert.equal( storage.getItem( prefix + 'k' ), null );
    });

    it( 'rejects with status 0 on a network error', async () => {
        setUp( undefined, { '/a.json': { networkError: true } } );
        let { getJSON } = await utilities();
        await assert.rejects( getJSON( { key: 'k', url: '/a.json' } ), { status: 0 } );
    });

    it( 'rejects invalid JSON', async () => {
        setUp( undefined, { '/a.json': { status: 200, body: '<html>' } } );
        let { getJSON } = await utilities();
        await assert.rejects( getJSON( { key: 'k', url: '/a.json' } ), SyntaxError );
    });
});

describe( 'clearStorage', () => {
    it( 'removes all data cached by the app (any version), and leaves other items alone', async () => {
        let storage = setUp( new FakeStorage( {
            'laidlaw-second': cached( {} ),
            'floorplans-0.1-brotherton-m1': cached( {} ),
            [ prefix + 'brotherton-m2' ]: cached( {} ),
            'someOtherSetting': 'dark'
        } ) );
        let { clearStorage } = await utilities();
        clearStorage();
        assert.deepEqual( storage.keys(), [ 'someOtherSetting' ] );
    });

    it( 'does not throw when localStorage is blocked', async () => {
        setUp();
        globalThis.localStorage = { get length() { throw new DOMException( 'The operation is insecure.', 'SecurityError' ); } };
        let { clearStorage } = await utilities();
        assert.doesNotThrow( () => clearStorage() );
    });
});
