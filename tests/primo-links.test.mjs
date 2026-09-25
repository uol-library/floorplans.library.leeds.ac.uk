/**
 * Checks the Primo links from the live logs (tests/fixtures/primo-links.txt) -
 * none should cause an error, and nearly all should find a shelf. A drop in the
 * match rate probably means a change to the shelf names or the matching rules.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getStartParams } from '../assets/js/modules/routing.mjs';
import { setLocation, readFixture } from './helpers.mjs';

const links = readFixture( 'primo-links.txt' );
const knownLibraries = /[?&](amp;)?library=(BL|EBL|HSL|LL)(&|$)/i;

describe( 'Primo links from the logs', () => {
    let results = links.map( link => {
        setLocation( link );
        try {
            return { link, params: getStartParams() };
        } catch ( error ) {
            return { link, error };
        }
    });

    it( 'are all handled without an error', () => {
        let errors = results.filter( r => r.error ).map( r => r.link + ': ' + r.error.message );
        assert.deepEqual( errors, [] );
    });

    it( 'all load a floor when the library is known', () => {
        let missing = results.filter( r => knownLibraries.test( r.link ) && ! r.params?.floorid ).map( r => r.link );
        assert.deepEqual( missing, [] );
    });

    it( 'nearly all find a shelf (at least 96%)', () => {
        let matched = results.filter( r => r.params?.shelfid ).length;
        let rate = matched / links.length;
        assert.ok( rate >= 0.96, `${matched} of ${links.length} links (${( rate * 100 ).toFixed( 1 )}%) found a shelf` );
    });
});
