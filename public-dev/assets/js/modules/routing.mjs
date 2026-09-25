import { floorplans } from './config.mjs';

/**
 * Functions to help with routing:
 * - what to load into the app initially
 * - changing the URL of the app (and the browser history) when the floor changes
 *
 * URLs for the app are in the form /{library}/{floor}/{shelf name}, e.g.
 * /brotherton/m2/Philosophy - libraries with a single floor leave out the floor,
 * e.g. /healthsciences/Pamphlets. .htaccess serves index.html for these paths.
 */

/**
 * Gets the parameters for the view to load from the current URL. The URL is one of:
 * - an app URL: /{library}/{floor}/{shelf name}
 * - a Primo link: /floorplan?library=...&floor=...&classmark=...
 * - an old URL: /{library}/floors/{floor}/?classmark=...
 * - an old hash URL: #{library}/{floor}/{shelf name}
 * The path can also be given in a path parameter (index.html?path=...), which is
 * how .htaccess used to pass it to the app.
 *
 * @returns {Object} parameters from the URL
 */
export function getStartParams() {
    let params = {
        library: false,
        floorid: false,
        shelfid: false,
        shelfname: false,
        classmark: false,
        search: false,
        path: false
    }
    /* Primo sometimes encodes & as &amp; in the links */
    const searchParams = new URLSearchParams( window.location.search.replace( /&amp;/g, '&' ) );
    params.search = searchParams.toString();
    let pathParams = getPathSegments( searchParams.has( 'path' ) ? searchParams.get( 'path' ) : window.location.pathname );
    params.path = pathParams;
    let shelfname = false;

    if ( pathParams[0] === 'floorplan' ) {
        /**
         * Primo link - like this:
         * https://floorplans.library.leeds.ac.uk/floorplan?library=LL&classmark=Sociology+A-0.06+DUR%2FG&floor=ll3
         */
        params.library = getLibraryID( searchParams.get( 'library' ) );
        if ( params.library === 'healthsciences' ) {
            params.floorid = 'health-sciences';
        } else if ( params.library ) {
            params.floorid = getFloorID( searchParams.get( 'floor' ) );
        }
    } else if ( getLibrary( pathParams[0] ) ) {
        params.library = pathParams[0];
        let lib = getLibrary( params.library );
        let floorParams = pathParams.slice( 1 );
        if ( floorParams[0] === 'floors' ) {
            /*
             * Old URLs like:
             * https://floorplans.library.leeds.ac.uk/laidlaw/floors/third/?classmark=Sociology+A-0.06+DUR%2FG
             */
            floorParams = floorParams.slice( 1 );
        }
        if ( lib.floors.length === 1 ) {
            /* single floor libraries have no floor in the URL */
            params.floorid = lib.floors[0].floorid;
            shelfname = floorParams[0] || false;
        } else if ( floorParams.length && getFloor( params.library + '-' + floorParams[0] ) ) {
            params.floorid = params.library + '-' + floorParams[0];
            shelfname = floorParams[1] || false;
        }
    } else if ( window.location.hash !== '' ) {
        /* old hash URLs, like #brotherton/m2/Philosophy or #health-sciences/Pamphlets */
        let paramhash = getPathSegments( window.location.hash.substring(1) );
        if ( paramhash[0] === 'health-sciences' || paramhash[0] === 'healthsciences' ) {
            params.library = 'healthsciences';
            params.floorid = 'health-sciences';
            shelfname = paramhash[1] || false;
        } else if ( getLibrary( paramhash[0] ) ) {
            params.library = paramhash[0];
            if ( paramhash.length > 1 && getFloor( paramhash[0] + '-' + paramhash[1] ) ) {
                params.floorid = paramhash[0] + '-' + paramhash[1];
                shelfname = paramhash[2] || false;
            }
        }
    }

    if ( shelfname ) {
        /* shelf name from an app URL - look for the exact name, then treat it like a classmark */
        let shelf = getShelves( params.library, params.floorid ).find( s => s.name.toLowerCase() === shelfname.toLowerCase() )
            || getShelfFromClassmark( params.library, params.floorid, shelfname );
        if ( shelf ) {
            params.floorid = shelf.floorid;
            params.shelfid = shelf.shelfid;
            params.shelfname = shelf.name;
        }
    }
    if ( searchParams.has( 'classmark' ) ) {
        params.classmark = cleanClassmark( searchParams.get( 'classmark' ) );
        /* Health Sciences classmarks are sometimes linked from other libraries */
        if ( params.classmark.match( /^Health Sciences /i ) ) {
            params.library = 'healthsciences';
            params.floorid = 'health-sciences';
        }
        let shelf = getShelfFromClassmark( params.library, params.floorid, params.classmark );
        if ( shelf ) {
            /* the shelf is where the item is, even if Primo says it is on a different floor */
            params.floorid = shelf.floorid;
            params.shelfid = shelf.shelfid;
            params.shelfname = shelf.name;
        }
    }
    /* fall back to the first floor of the library */
    if ( params.library && ! params.floorid ) {
        params.floorid = getLibrary( params.library ).floors[0].floorid;
    }
    return params;
}

/**
 * Splits a path into decoded segments, ignoring the base path of the site,
 * empty segments and index.html
 *
 * @param {String} path
 * @returns {Array} segments
 */
function getPathSegments( path ) {
    let base = getBasePath();
    if ( base && path.startsWith( base ) ) {
        path = path.substring( base.length );
    }
    return path.split( '/' )
        .filter( p => p !== '' && p !== 'index.html' )
        .map( p => {
            try {
                return decodeURIComponent( p );
            } catch ( e ) {
                return p;
            }
        });
}

/**
 * Gets the path the site is served from (without a trailing slash), e.g. '' at
 * the root of the domain
 *
 * @returns {String}
 */
function getBasePath() {
    try {
        return new URL( floorplans.imgconf.baseURL, window.location.href ).pathname.replace( /\/$/, '' );
    } catch ( e ) {
        return '';
    }
}

/**
 * Builds the app URL for a floor, and optionally a shelf on that floor
 *
 * @param {String} floorid
 * @param {String|Boolean} shelfid
 * @returns {String|Boolean} URL path, e.g. /brotherton/m2/Philosophy
 */
export function getFloorURL( floorid, shelfid = false ) {
    let lib = floorplans.libraries.find( l => l.floors.some( f => f.floorid === floorid ) );
    if ( ! lib ) {
        return false;
    }
    let segments = [ lib.id ];
    if ( lib.floors.length > 1 ) {
        segments.push( floorid.replace( lib.id + '-', '' ) );
    }
    if ( shelfid ) {
        let shelf = getShelves( lib.id, floorid ).find( s => s.shelfid === shelfid );
        if ( shelf ) {
            segments.push( shelf.name );
        }
    }
    return getBasePath() + '/' + segments.map( s => encodeURIComponent( s ) ).join( '/' );
}

/**
 * Sends a Primo link (/floorplan?library=...&floor=...&classmark=...) to the
 * floorplans on the library website, which shows the app in an iframe, e.g.
 * https://library.leeds.ac.uk/locations/libraries/brotherton?floor=w2&classmark=Theatre%20Q-11%20LYN/C#floorplans-brotherton
 * This replaces the redirect which was done by floorplans-broker.php, and is
 * turned on with redirect_primo_links in the Jekyll config. The floor is the one
 * found for the classmark, so items which have moved are shown on the right floor.
 *
 * @returns {Boolean} true if the page is being redirected
 */
export function redirectPrimoLink() {
    if ( ! floorplans.conf.redirectPrimoLinks || isEmbedded() ) {
        return false;
    }
    let params = getStartParams();
    if ( ! params.path || params.path[0] !== 'floorplan' ) {
        return false;
    }
    window.location.replace( getLibrarySiteURL( params ) );
    return true;
}

/**
 * Builds the URL of the floorplans for a library on the library website
 *
 * @param {Object} params - from getStartParams()
 * @returns {String} URL
 */
function getLibrarySiteURL( params ) {
    let url = 'https://library.leeds.ac.uk/locations/libraries';
    let pages = {
        brotherton: 'brotherton',
        edwardboyle: 'edward-boyle',
        healthsciences: 'health-sciences',
        laidlaw: 'laidlaw'
    };
    let page = pages[ params.library ];
    if ( ! page ) {
        return url;
    }
    url += '/' + page;
    let classmark = new URLSearchParams( window.location.search.replace( /&amp;/g, '&' ) ).get( 'classmark' );
    /**
     * The library website uses these to set the URL of the app in its iframe, e.g.
     * ?floor=w2&classmark=... => /brotherton/floors/w2?classmark=...
     * The floor is as used in the old URLs, e.g. brotherton-w2 => w2 (empty for
     * single floor libraries)
     */
    let query = [];
    if ( params.floorid ) {
        let lib = getLibrary( params.library );
        let floor = lib.floors.length > 1 ? params.floorid.replace( params.library + '-', '' ) : '';
        query.push( 'floor=' + encodeURIComponent( floor ) );
    }
    if ( classmark ) {
        query.push( 'classmark=' + encodeURIComponent( classmark ).replace( /%2F/g, '/' ) );
    }
    if ( query.length ) {
        url += '?' + query.join( '&' );
    }
    return url + '#floorplans-' + page;
}

/**
 * Whether the app is embedded in an iframe on another page
 *
 * @returns {Boolean}
 */
function isEmbedded() {
    try {
        return window.self !== window.top;
    } catch ( e ) {
        return true;
    }
}

/**
 * Keeps the URL and browser history in step with the floor being viewed:
 * - when a floor is loaded, the URL is changed and an entry added to the history
 *   (the first floor loaded replaces the current entry instead, so Primo and old
 *   URLs are swapped for the app URL)
 * - when the back / forward buttons are used, the floor for that URL is loaded
 * When the app is embedded in an iframe (e.g. on https://library.leeds.ac.uk/locations)
 * the URL is always replaced rather than added to the history, as the history is
 * shared with the parent page, and the back button should leave that page
 *
 * @param {Function} navigate - called with the params from getStartParams() for
 * the new URL when the back or forward buttons are used, and should load the floor
 */
export function initHistory( navigate ) {
    let first = true;
    let embedded = isEmbedded();
    document.addEventListener( 'fpfloorloaded', e => {
        let url = getFloorURL( e.detail.floor.floorid, e.detail.shelfid );
        if ( ! url ) {
            return;
        }
        let state = { floorid: e.detail.floor.floorid, shelfid: e.detail.shelfid || false };
        if ( first || embedded || url === window.location.pathname ) {
            /* first floor, or the floor for the URL we're already on (after back / forward) */
            history.replaceState( state, '', url );
        } else {
            history.pushState( state, '', url );
        }
        first = false;
    });
    window.addEventListener( 'popstate', () => {
        let params = getStartParams();
        if ( params.floorid ) {
            navigate( params );
        }
    });
}

/**
 * Gets a library from the config
 *
 * @param {String} libraryid - library ID (as used in this app)
 * @returns {Object|undefined} library
 */
function getLibrary( libraryid ) {
    return floorplans.libraries.find( lib => lib.id === libraryid );
}

/**
 * Gets a floor from the config
 *
 * @param {String} floorid - floor ID (as used in this app)
 * @returns {Object|undefined} floor
 */
function getFloor( floorid ) {
    return floorplans.libraries.flatMap( lib => lib.floors ).find( f => f.floorid === floorid );
}

/**
 * Gets the id of a library (as used in this app) from a code used in Primo
 *
 * @param {String} param - Primo Library code
 * @returns {String|Boolean} library ID
 */
function getLibraryID( param ) {
    let libraries = {
        'LL': 'laidlaw',
        'BL': 'brotherton',
        'EBL': 'edwardboyle',
        'HSL': 'healthsciences'
    }
    param = ( param || '' ).toUpperCase();
    return libraries.hasOwnProperty( param ) ? libraries[ param ] : false;
}

/**
 * Gets the id of a library floor (as used in this app) from a code used in Primo
 *
 * @param {String} param - Primo floor code
 * @returns {String|Boolean} floor ID
 */
function getFloorID( param ) {
    let floors = {
        'llhdc': 'laidlaw-ground',
        'll1':  'laidlaw-first',
        'll2':  'laidlaw-second',
        'll3':  'laidlaw-third',
        'blmic': 'brotherton-m1',
        'blm1':  'brotherton-m1',
        'blm2':  'brotherton-m2',
        'blm3':  'brotherton-m3',
        'blm4':  'brotherton-m4',
        'blw2':  'brotherton-w2',
        'blw2a': 'brotherton-w2',
        'blw3':  'brotherton-w3',
        'ebl8': 'edwardboyle-8',
        'ebl9': 'edwardboyle-9',
        'ebl10': 'edwardboyle-10',
        'ebl11': 'edwardboyle-11',
        'ebl12': 'edwardboyle-12',
        'ebl13': 'edwardboyle-13'
    }
    param = ( param || '' ).toLowerCase();
    return floors.hasOwnProperty( param ) ? floors[ param ] : false;
}

/**
 * Tidies up a classmark from a URL - some are double encoded (e.g. %2520), and
 * some contain Primo template placeholders which haven't been replaced
 *
 * @param {String} classmark
 * @returns {String} classmark
 */
function cleanClassmark( classmark ) {
    if ( classmark.match( /%[0-9a-f]{2}/i ) ) {
        try {
            classmark = decodeURIComponent( classmark );
        } catch ( e ) {
            /* not encoded after all */
        }
    }
    if ( classmark.match( /\{.*\}/ ) ) {
        return '';
    }
    return classmark.replace( /\s+/g, ' ' ).trim();
}

/**
 * Gets the shelves in a library (or on a single floor) from floorplans.featureMap,
 * which is built by _scripts/writeFeatureMaps.js from the GeoJSON features. Each
 * shelf has a list of keys used to match classmarks against:
 * - comma-separated names are split, e.g. "CD, DVD (All Subjects)" => CD, DVD
 * - bracketed text is removed
 * - codes are taken from Health Sciences names, e.g. "WA - Patients and Primary Care" => WA
 * - letter ranges are separated, e.g. "Modern History A-R" => Modern History (A to R)
 *
 * @param {String|Boolean} library - library ID
 * @param {String|Boolean} floorid - restrict to shelves on this floor
 * @returns {Array} shelves
 */
function getShelves( library, floorid ) {
    let lib = library ? getLibrary( library ) : false;
    let floorids = floorid ? [ floorid ] : ( lib ? lib.floors.map( f => f.floorid ) : [] );
    return floorplans.featureMap.map( ( [ name, id ] ) => {
        let pos = id.lastIndexOf( '-' );
        let shelf = {
            name: name,
            floorid: id.substring( 0, pos ),
            shelfid: 'shelf' + id.substring( pos + 1 ),
            keys: []
        };
        name.replace( /\(.*?\)/g, '' ).split( ',' ).forEach( part => {
            part = part.trim();
            let code = part.match( /^([A-Z]{1,3})\s*-\s*\S/ );
            let range = part.match( /^(.+) ([A-Z])-([A-Z])$/ );
            if ( code && floorids[0] === 'health-sciences' ) {
                shelf.keys.push( { text: code[1] } );
            } else if ( range ) {
                shelf.keys.push( { text: range[1], from: range[2], to: range[3] } );
            } else if ( part !== '' ) {
                shelf.keys.push( { text: part } );
            }
        });
        return shelf;
    }).filter( shelf => floorids.includes( shelf.floorid ) );
}

/**
 * Normalises a shelf name or classmark for comparison - shelf names and Primo
 * classmarks sometimes use different spellings of the same subject
 *
 * @param {String} name
 * @returns {String}
 */
function normaliseName( name ) {
    return name.toLowerCase()
        .replace( /\bcommunications studies\b/g, 'communication studies' )
        .replace( /\bscandanavian\b/g, 'scandinavian' )
        .replace( /\bportugese\b/g, 'portuguese' );
}

/**
 * Shelves with generic names (which aren't subjects) are only matched on the
 * floor given in the Primo link, not across the whole library
 *
 * @param {Object} shelf - from getShelves()
 * @returns {Boolean}
 */
function isGenericShelf( shelf ) {
    return /^(Large|Journals?|Stack|Pamphlets|Maps|Microfilm|Recently Returned|Reshelving Area)$/i.test( shelf.name );
}

/**
 * Checks whether a classmark (or a candidate name derived from it) starts with
 * one of a shelf's keys. Returns the length of the longest matching key so the
 * most specific shelf can be chosen, or 0 if there is no match.
 *
 * @param {Object} shelf - from getShelves()
 * @param {String} candidate
 * @returns {Number}
 */
function matchShelf( shelf, candidate ) {
    let best = 0;
    let lc = normaliseName( candidate );
    shelf.keys.forEach( key => {
        let text = normaliseName( key.text );
        if ( ! lc.startsWith( text ) ) {
            return;
        }
        let rest = lc.substring( text.length );
        if ( key.from ) {
            /* the classmark needs to be followed by a letter in the range, e.g. "Modern History C-2.1 ABC" */
            let letter = rest.match( /^ ([A-Z])\b/i );
            if ( ! letter || letter[1].toUpperCase() < key.from || letter[1].toUpperCase() > key.to ) {
                return;
            }
        } else if ( rest.match( /^[a-z0-9]/i ) ) {
            /* only match whole words */
            return;
        }
        best = Math.max( best, text.length );
    });
    return best;
}

/**
 * Gets candidate shelf names for a Primo classmark, in order of preference. These
 * are based on the rules in the old floorplans-broker.php script. Candidates marked
 * floorOnly are only matched against shelves on the floor given in the Primo link.
 *
 * @param {String} classmark
 * @param {String|Boolean} floorid
 * @returns {Array} candidates - { name: String, floorOnly: Boolean }
 */
function getCandidates( classmark, floorid ) {
    let candidates = [];
    let add = ( name, floorOnly = false ) => candidates.push( { name, floorOnly } );
    /* some collections are shelved under shorter names */
    let c = classmark
        .replace( /^(Stack )?Owen Lattimore Collection/i, '$1Lattimore' )
        .replace( /^(Stack )?Holden Library/i, '$1Holden' );

    if ( c.match( /^Health Sciences /i ) ) {
        let hs = c.replace( /^Health Sciences /i, '' );
        if ( hs.match( /^Pamphlet/i ) ) {
            add( 'Pamphlets' );
        } else if ( hs.match( /Video|VHS|Audio CD|DVD/i ) ) {
            add( 'AVC' );
        } else {
            /* class letters, e.g. "Health Sciences WA 590 WIL" => WA */
            let code = hs.match( /^([A-Z]{1,3})\b/ );
            if ( code ) {
                add( code[1] );
            }
            add( hs );
        }
        return candidates;
    }
    if ( c.match( /^Video/i ) ) {
        add( 'DVD' );
    }
    if ( c.match( /Atlas Case/i ) ) {
        add( 'Atlases' );
        add( 'Atlas Case' );
    }
    if ( floorid === 'brotherton-w2' ) {
        if ( c.match( /^Stack Large/i ) ) {
            add( 'All Stack Large A-Z' );
        } else if ( c.match( /^Large .* A-0/i ) || c.match( /Newspapers/i ) ) {
            add( 'All Large Journals & Foreign Newspapers' );
        }
    }
    let journal = c.match( /^(.+?) A-0(\.01)? /i );
    if ( journal ) {
        if ( floorid === 'brotherton-w3' ) {
            add( 'Current Periodicals', true );
        }
        add( journal[1] + ' Journals' );
        add( 'Journals', true );
        add( 'Journal', true );
    }
    /* pamphlets are shelved with the subject if there isn't a pamphlets shelf */
    let pamphlet = c.match( /^Pamphlets? (.+)$/i );
    if ( pamphlet ) {
        add( 'Pamphlets', true );
        add( pamphlet[1] );
    }
    add( c );
    /* large items are shelved with the subject if there isn't a large shelf */
    let large = c.match( /^Large (.+)$/i );
    if ( large ) {
        add( 'Large', true );
        add( large[1], true );
    }
    return candidates;
}

/**
 * Gets the details of a shelf from a Primo classmark. Shelves on the floor given
 * in the Primo link are checked first, then shelves on other floors in the library.
 *
 * @param {String|Boolean} library - library ID
 * @param {String|Boolean} floorid - floor ID
 * @param {String} classmark - Primo classmark
 * @returns {Object|Boolean} shelf details - { name, floorid, shelfid }
 */
export function getShelfFromClassmark( library, floorid, classmark ) {
    if ( ! classmark || ( ! library && ! floorid ) ) {
        return false;
    }
    let candidates = getCandidates( classmark, floorid );
    let scopes = [];
    if ( floorid ) {
        scopes.push( { shelves: getShelves( library, floorid ), floorOnly: true } );
    }
    if ( library ) {
        scopes.push( { shelves: getShelves( library, false ), floorOnly: false } );
    }
    for ( let scope of scopes ) {
        for ( let candidate of candidates ) {
            if ( candidate.floorOnly && ! scope.floorOnly ) {
                continue;
            }
            let best = false, bestLength = 0;
            scope.shelves.forEach( shelf => {
                if ( ! scope.floorOnly && isGenericShelf( shelf ) ) {
                    return;
                }
                let length = matchShelf( shelf, candidate.name );
                if ( length > bestLength ) {
                    best = shelf;
                    bestLength = length;
                }
            });
            if ( best ) {
                return { name: best.name, floorid: best.floorid, shelfid: best.shelfid };
            }
        }
    }
    return false;
}
