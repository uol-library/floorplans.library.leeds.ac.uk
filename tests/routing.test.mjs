/**
 * Tests for reading and building app URLs, and matching Primo classmarks to shelves
 * (assets/js/modules/routing.mjs)
 */
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { floorplans } from '../assets/js/modules/config.mjs';
import { getStartParams, getFloorURL, getShelfFromClassmark } from '../assets/js/modules/routing.mjs';
import { setLocation } from './helpers.mjs';

/* the view the app would load for a URL */
function paramsFor( url ) {
    setLocation( url );
    return getStartParams();
}

/* all shelves from the feature map, as { name, floorid, shelfid } */
const shelves = floorplans.featureMap.map( ( [ name, id ] ) => ({
    name,
    floorid: id.substring( 0, id.lastIndexOf( '-' ) ),
    shelfid: 'shelf' + id.substring( id.lastIndexOf( '-' ) + 1 )
}));

const productionBase = floorplans.imgconf.baseURL;
afterEach( () => {
    floorplans.imgconf.baseURL = productionBase;
});

describe( 'App URLs (/{library}/{floor}/{shelf name})', () => {
    it( 'loads a floor and shelf', () => {
        let p = paramsFor( '/brotherton/m2/Philosophy' );
        assert.equal( p.floorid, 'brotherton-m2' );
        assert.equal( p.shelfname, 'Philosophy' );
        assert.match( p.shelfid, /^shelf\d+$/ );
    });
    it( 'loads a floor without a shelf', () => {
        let p = paramsFor( '/laidlaw/third' );
        assert.equal( p.floorid, 'laidlaw-third' );
        assert.equal( p.shelfid, false );
    });
    it( 'leaves out the floor for single floor libraries', () => {
        let p = paramsFor( '/healthsciences/Pamphlets' );
        assert.equal( p.floorid, 'health-sciences' );
        assert.equal( p.shelfname, 'Pamphlets' );
    });
    it( 'loads the first floor of a library when there is no floor', () => {
        assert.equal( paramsFor( '/brotherton' ).floorid, 'brotherton-m1' );
    });
    it( 'matches shelf names regardless of case and encoding', () => {
        assert.equal( paramsFor( '/brotherton/m2/philosophy' ).shelfname, 'Philosophy' );
        assert.equal( paramsFor( '/brotherton/m1/CD%2C%20DVD%20(All%20Subjects)' ).shelfname, 'CD, DVD (All Subjects)' );
    });
    it( 'treats a shelf name which does not match exactly as a classmark', () => {
        assert.equal( paramsFor( '/brotherton/m2/Modern History C-2.1' ).shelfname, 'Modern History A-R' );
    });
    it( 'ignores the home page, index.html and unknown paths', () => {
        for ( let url of [ '/', '/index.html', '/nonsense/x', '/brotherton-m2' ] ) {
            assert.equal( paramsFor( url ).floorid, false, url );
        }
    });
    it( 'accepts the path in a path parameter (as .htaccess used to redirect)', () => {
        assert.equal( paramsFor( '/index.html?path=brotherton/m2/Philosophy' ).shelfname, 'Philosophy' );
    });
});

describe( 'Old URLs', () => {
    it( 'loads the floors embedded in the library website', () => {
        assert.equal( paramsFor( '/brotherton/floors/m3/' ).floorid, 'brotherton-m3' );
        assert.equal( paramsFor( '/edwardboyle/floors/9/' ).floorid, 'edwardboyle-9' );
        assert.equal( paramsFor( '/healthsciences/floors/' ).floorid, 'health-sciences' );
        assert.equal( paramsFor( '/laidlaw/floors/ground/' ).floorid, 'laidlaw-ground' );
    });
    it( 'matches a classmark on an old URL', () => {
        let p = paramsFor( '/brotherton/floors/w2?classmark=Theatre%20Q-11%20LYN%2FC' );
        assert.equal( p.floorid, 'brotherton-w2' );
        assert.equal( p.shelfname, 'Theatre' );
    });
    it( 'handles the old redirected form (index.html?path=...)', () => {
        let p = paramsFor( '/index.html?path=brotherton/floors/m2/&classmark=Philosophy+O-0.06+JAN' );
        assert.equal( p.floorid, 'brotherton-m2' );
        assert.equal( p.shelfname, 'Philosophy' );
    });
    it( 'handles old hash URLs', () => {
        assert.equal( paramsFor( '/#brotherton/m2/Philosophy' ).shelfname, 'Philosophy' );
        assert.equal( paramsFor( '/#health-sciences/Pamphlets' ).floorid, 'health-sciences' );
    });
});

describe( 'Primo links (/floorplan?library=...&floor=...&classmark=...)', () => {
    /* [ library, floor, classmark, expected floor, expected shelf ] */
    const cases = [
        [ 'BL', 'blw2', 'Theatre Q-11 LYN/C', 'brotherton-w2', 'Theatre' ],
        [ 'BL', 'blm2', 'Modern History D-6.09 VIL', 'brotherton-m2', 'Modern History A-R' ],
        [ 'BL', 'blm2', 'Modern History T-4 SMI', 'brotherton-m2', 'Modern History S-Z' ],
        [ 'BL', 'blm1', 'Chinese H-1.653 WANG', 'brotherton-m1', 'Chinese E-V' ],
        [ 'BL', 'blm1', 'Chinese W-0.081 WANG', 'brotherton-m1', 'Chinese V-Z' ],
        [ 'BL', 'blm1', 'Video Spanish BIR', 'brotherton-m1', 'CD, DVD (All Subjects)' ],
        [ 'BL', 'blm1', 'Large General Languages A-1 KLO', 'brotherton-m1', 'General Languages' ],
        [ 'BL', 'blm4', 'Pamphlets English Q-1 ROB', 'brotherton-m4', 'English' ],
        [ 'BL', 'blw2a', 'Theology A-0.01 JOU', 'brotherton-w2', 'Theology Journals' ],
        [ 'BL', 'blw2a', 'Large Bibliography A-0.01 TIM', 'brotherton-w2', 'All Large Journals & Foreign Newspapers' ],
        [ 'BL', 'blw2a', 'Owen Lattimore Collection A-0.01 SHI', 'brotherton-w2', 'Lattimore Journals' ],
        [ 'BL', 'blw2', 'Stack Large Art ABC', 'brotherton-w2', 'All Stack Large A-Z' ],
        [ 'BL', 'blw2', 'Stack Owen Lattimore Collection ASH', 'brotherton-w2', 'Stack Lattimore' ],
        [ 'EBL', 'ebl8', 'Food A-0.01 PRO', 'edwardboyle-8', 'Journal' ],
        [ 'EBL', 'ebl11', 'Large Mechanical Engineering A-1 SMI', 'edwardboyle-11', 'Large' ],
        [ 'EBL', 'ebl12', 'Mathematics K-3 MAC', 'edwardboyle-11', 'Mathematics' ],
        [ 'HSL', 'mdl', 'Health Sciences WA 590 WIL', 'health-sciences', 'WA - Patients and Primary Care' ],
        [ 'HSL', 'mdl', 'Health Sciences WZ 90 WM 300 ATK', 'health-sciences', 'WZ - History of Medicine' ],
        [ 'HSL', 'mdl', 'Health Sciences QV 55 BRI', 'health-sciences', 'QV -Pharmacology' ],
        [ 'HSL', 'mdl', 'Health Sciences Pamphlet 123', 'health-sciences', 'Pamphlets' ],
        [ 'HSL', 'mdlhd', 'Health Sciences Video 199', 'health-sciences', 'AVC - Audio-Visual Collection' ],
        [ 'HSL', 'mdl', 'Psychology P-8.3 YAG', 'health-sciences', 'Psychology' ],
        [ 'LL', 'll1', 'Communications Studies B-1 AIE', 'laidlaw-first', 'Communication Studies' ],
        [ 'LL', 'll3', 'Sociology A-0.06 DUR/G', 'laidlaw-third', 'Sociology' ]
    ];
    for ( let [ library, floor, classmark, floorid, shelfname ] of cases ) {
        it( `${library} ${floor} "${classmark}" => ${shelfname}`, () => {
            let p = paramsFor( '/floorplan?' + new URLSearchParams( { library, floor, classmark } ) );
            assert.equal( p.floorid, floorid );
            assert.equal( p.shelfname, shelfname );
        });
    }

    it( 'uses the floor of the shelf when Primo gives a different floor (stock moved)', () => {
        let p = paramsFor( '/floorplan?library=LL&floor=ll1&classmark=Sociology+A-2+ALV' );
        assert.equal( p.floorid, 'laidlaw-third' );
        assert.equal( p.shelfname, 'Sociology' );
    });
    it( 'matches generic shelves (e.g. Large, Pamphlets) only on the floor given', () => {
        /* there are Large shelves on m4 and Pamphlets on m3, but nothing matching on m1 */
        assert.equal( getShelfFromClassmark( 'brotherton', 'brotherton-m1', 'Large Xylography A-1 ABC' ), false );
        assert.equal( getShelfFromClassmark( 'brotherton', 'brotherton-m1', 'Pamphlets Xylography A-1 ABC' ), false );
        /* but they are matched on the floor given */
        assert.equal( getShelfFromClassmark( 'brotherton', 'brotherton-m4', 'Large Xylography A-1 ABC' ).name, 'Large' );
    });
    it( 'handles &amp; in the query string', () => {
        let p = paramsFor( '/floorplan?library=BL&amp;floor=blm2&amp;classmark=Modern+History+B-0.07+WEI' );
        assert.equal( p.shelfname, 'Modern History A-R' );
    });
    it( 'handles lower case library codes', () => {
        let p = paramsFor( '/floorplan?library=ll&floor=ll3&classmark=politics+q-0.1+wei' );
        assert.equal( p.floorid, 'laidlaw-third' );
        assert.equal( p.shelfname, 'Politics' );
    });
    it( 'handles double encoded classmarks', () => {
        let p = paramsFor( '/floorplan?library=BL&floor=blm2&classmark=Modern%2520History%2520A-P' );
        assert.equal( p.shelfname, 'Modern History A-R' );
    });
    it( 'handles unknown floor codes without an error', () => {
        let p = paramsFor( '/floorplan?library=LL&floor=llafr&classmark=Modern+History+B-8.8+GER' );
        assert.equal( p.floorid, 'laidlaw-third' );
        assert.equal( p.shelfname, 'Modern History' );
    });
    it( 'ignores unfilled {call_number} placeholders and falls back to the first floor', () => {
        let p = paramsFor( '/floorplan?library=BL&classmark=%7Bcall_number%7D&floor=acq' );
        assert.equal( p.floorid, 'brotherton-m1' );
        assert.equal( p.shelfid, false );
    });
    it( 'sends Health Sciences classmarks to Health Sciences from other libraries', () => {
        let p = paramsFor( '/floorplan?library=BL&classmark=Health+Sciences+WQ+160+JOH&floor=acq' );
        assert.equal( p.floorid, 'health-sciences' );
        assert.equal( p.shelfname, 'WQ - Obstetrics' );
    });
    it( 'loads nothing for unknown libraries', () => {
        assert.equal( paramsFor( '/floorplan?library=SPCOLL&classmark=Special+Collections+Newspapers+JOU&floor=blspc' ).floorid, false );
    });
});

describe( 'getShelfFromClassmark', () => {
    it( 'returns false without a classmark, or without a library and floor', () => {
        assert.equal( getShelfFromClassmark( 'brotherton', 'brotherton-m2', '' ), false );
        assert.equal( getShelfFromClassmark( false, false, 'Philosophy' ), false );
    });
    it( 'only matches whole words', () => {
        let shelf = getShelfFromClassmark( 'brotherton', 'brotherton-w2', 'Artificial Things' );
        assert.notEqual( shelf && shelf.name, 'Art' );
    });
});

describe( 'getFloorURL', () => {
    it( 'builds app URLs', () => {
        setLocation( '/' );
        let philosophy = shelves.find( s => s.floorid === 'brotherton-m2' && s.name === 'Philosophy' );
        assert.equal( getFloorURL( 'brotherton-m2', philosophy.shelfid ), '/brotherton/m2/Philosophy' );
        assert.equal( getFloorURL( 'laidlaw-third' ), '/laidlaw/third' );
        assert.equal( getFloorURL( 'health-sciences' ), '/healthsciences' );
        assert.equal( getFloorURL( 'nowhere' ), false );
    });
    it( 'encodes shelf names', () => {
        setLocation( '/' );
        let dvd = shelves.find( s => s.name === 'CD, DVD (All Subjects)' );
        assert.equal( getFloorURL( dvd.floorid, dvd.shelfid ), '/brotherton/m1/' + encodeURIComponent( 'CD, DVD (All Subjects)' ) );
    });
    it( 'round trips every shelf (URL => view => URL)', () => {
        for ( let shelf of shelves ) {
            let url = getFloorURL( shelf.floorid, shelf.shelfid );
            let p = paramsFor( url );
            assert.equal( p.floorid, shelf.floorid, url );
            assert.equal( p.shelfid, shelf.shelfid, url );
        }
    });
    it( 'includes the base path when the site is served from a subpath (GitHub Pages)', () => {
        floorplans.imgconf.baseURL = 'https://uol-library.github.io/floorplans.library.leeds.ac.uk';
        setLocation( 'https://uol-library.github.io/floorplans.library.leeds.ac.uk/' );
        for ( let shelf of shelves ) {
            let url = getFloorURL( shelf.floorid, shelf.shelfid );
            assert.ok( url.startsWith( '/floorplans.library.leeds.ac.uk/' ), url );
            let p = paramsFor( 'https://uol-library.github.io' + url );
            assert.equal( p.shelfid, shelf.shelfid, url );
        }
    });
});
