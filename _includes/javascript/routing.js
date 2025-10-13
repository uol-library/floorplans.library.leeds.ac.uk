/**
 * Functions to help with routing:
 * - what to load into the app initially
 * - changing the URI of the app for different views
 */

/**
 * Gets any parameters passed to the page in the querystring. This will load the 
 * appropriate library floor into the app if possible, and select a feature. The 
 * querystring is either one direct from Primo, or one from the old version of the
 * floorplans which used to be served from different directories.
 * 
 * @returns {Object} parameters from querystring
 */
function getStartParams() {
    let params = {
        library: false,
        floorid: false,
        shelfid: false,
        shelfname: false,
        classmark: false,
        search: false,
        path: false
    }
    if ( window.location.search ) {
        const searchParams = new URLSearchParams( window.location.search );
        params.search = searchParams.toString();
        let floorName = false;
        if ( searchParams.has( 'path' ) ) {
            let pathParams = searchParams.get( 'path' ).split('/');
            params.path = pathParams;
            if ( pathParams.length && pathParams[0] === 'floorplan' ) {
                /**
                 * Primo link - like this:
                 * https://floorplans.library.leeds.ac.uk/floorplan?library=LL&classmark=Sociology+A-0.06+DUR%2FG&floor=ll3
                 * which is rewritten to:
                 * https://floorplans.library.leeds.ac.uk/index.html?path=floorplan&library=LL&classmark=Sociology+A-0.06+DUR%2FG&floor=ll3
                 */
                if ( searchParams.has( 'library' ) ) {
                    params.library = getLibraryID( searchParams.get( 'library' ) );
                    if ( params.library ) {
                        if ( params.library === 'health-sciences' ) {
                            params.floorid = 'health-sciences';
                        } else if ( searchParams.has( 'floor' ) ) {
                            params.floorid = getFloorID( searchParams.get( 'floor' ) );
                            floorName = params.floorid.split('-').pop();
                        }
                    }
                }
            } else if ( pathParams.length >= 2 && pathParams[1] === 'floors' ) {
                /*
                 * Old URLs like:
                 * https://floorplans.library.leeds.ac.uk/laidlaw/floors/third/?classmark=Sociology+A-0.06+DUR%2FG
                 * which is rewritten to:
                 * https://floorplans.library.leeds.ac.uk/index.html?path=laidlaw/floors/third/&classmark=Sociology+A-0.06+DUR%2FG
                 */
                params.library = pathParams[0];
                if ( pathParams.length >= 3 ) {
                    floorName = pathParams[2];
                    if ( "brotherton" === params.library ) {
                        if ( ["m1", "m2", "m3", "m4", "w2", "w3"].indexOf( floorName ) !== -1 ) {
                            params.floorid = params.library + '-' + floorName;
                        }
                    } else if ( "edwardboyle" === params.library ) {
                        if ( parseInt( floorName ) >= 8 && parseInt( floorName ) <= 13 ) {
                            params.floorid = params.library + '-' + floorName;
                        }
                    } else if ( "healthsciences" === params.library ) {
                        params.floorid = 'health-sciences';
                    } else if (  "laidlaw" === params.library ) {
                        if ( ["ground", "first", "second", "third"].indexOf( floorName ) !== -1 ) {
                            params.floorid = params.library + '-' + floorName;
                        }
                    }
                }
            } else {

            }
        }
        if ( searchParams.has( 'classmark' ) ) {
            params.classmark = normaliseClassmark( searchParams.get( 'classmark' ), params );
            let feature = getFeatureFromClassmark( params.library, floorName, params.classmark );
            if ( feature ) {
                if ( ! params.floorid ) {
                    params.floorid = feature.floorid;
                }
                params.shelfid = feature.featureid;
                params.shelfname = feature.name;
            }
        }
    } else if ( window.location.hash !== '' ) {
        let paramhash = window.location.hash.substring(1).split('/');
        if ( paramhash[0] === 'health-sciences' ) {
            params.library = 'health-sciences';
            params.floorid = 'health-sciences';
        } else {
            params.library = paramhash[0];
        }
        if ( paramhash.length > 1 ) {
            if ( params.library === 'health-sciences' ) {
                params.shelfname = paramhash[1];
            } else {
                params.floorid = paramhash[0] + '-' + paramhash[1];
                if ( paramhash.length > 2 ) {
                    params.shelfname = paramhash[2];
                }
            }
        }
    }
    return params;
}

/**
 * Gets the id of a library (as used in this app) from a code used in Primo
 * 
 * @param {String} param - Primo Library code
 * @returns {String} library ID
 */
function getLibraryID( param ) {
    let libraries = {
        'LL': 'laidlaw',
        'BL': 'brotherton',
        'EBL': 'edwardboyle',
        'HSL': 'health-sciences'
    }
    if ( libraries.hasOwnProperty( param ) ) {
        return libraries[ param ];
    }
    return false;
}

/**
 * Gets the id of a library floor (as used in this app) from a code used in Primo
 * 
 * @param {String} param - Primo floor code
 * @returns {String} floor ID
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
    if ( floors.hasOwnProperty( param ) ) {
        return floors[ param ];
    }
    return false;
}

/**
 * Gets the details of a shelf feature from a classmark used in Primo
 *
 * @uses getFeatures() 
 * @param {String} library - library ID
 * @param {String} classmark - Primo classmark
 * @returns {Object} feature details
 */
function getFeatureFromClassmark( library, floorName, classmark ) {
    let features = getFeatures();
    let ret = false;
    if ( library === 'health-sciences' ) {

    }
    for ( let i = 0; i < features.length; i++ ) {
        let libraryRE = getLibraryRegex( library, floorName );
        if ( features[i][1].match( libraryRE ) ) {
            let featureRE = getFeatureRegex( features[i][0] );
            let featureDetails = false;
            if ( library === 'health-sciences' ) {
                if ( classmark === features[i][0] ) {
                    featureDetails = features[i][1].split( '-' );
                }
            } else if ( classmark.match( featureRE ) ) {
                featureDetails = features[i][1].split( '-' );
            }
            if ( featureDetails ) {
                ret = {
                    "name": features[i][0],
                    "library": featureDetails[0],
                    "floorid": featureDetails[0] + '-' + featureDetails[1],
                    "featureid": 'shelf-' + featureDetails[2]
                }
                break;
            }
        }
    }
    return ret;
}

/**
 * Takes a feature name and creates a RegEx to match against a Primo classmark
 * 
 * @param {String} featureName - Feature name
 * @returns {String} Regualr Expression
 */
function getFeatureRegex( featureName ) {
    // replace some characters in feature names
    featureName = featureName.replaceAll( '/(\[|\])/', '' );
    // split comma-separated lists to match any of the parts
    if ( featureName.indexOf(', ') !== -1 ) {
        featureName = '(' + ( featureName.split( ', ' ).join( '|' ) ) + ')';
    }
    return '^' + featureName + '.*$';
}

function getLibraryRegex( library, floorName ) {
    if ( ! floorName ) {
        return '^'+library + '.*$';
    } else {
        return '^'+library + '-' + floorName + '.*$';
    }
}

/**
 * Takes a Primo classmark and Normalises it in order to maximise the possibility
 * of matching it to a feature name
 * 
 * @param {String} classmark 
 * @returns 
 */
function normaliseClassmark( classmark, params ) {
    classmark = decodeURIComponent( classmark );
    if ( classmark.match( '^Video' ) ) {
        return 'DVD';
    }
    if ( classmark.match( 'Atlas Case' ) ) {
        return 'Atlases';
    }
    if ( classmark.match( '([a-zA-Z ]+) A-0\.01' ) ) {
        let res = classmark.match( '([a-zA-Z ]+) A-0\.01' );
        return res[1]+' Journals';
    }
    if ( params.floorid ) {
        switch ( params.floorid ) {
            case 'brotherton-w2':
                if ( classmark.match( 'Large .*' ) || classmark.match( 'Newspapers' ) ) {
                    return 'All Large Journals & Foreign Newspapers';
                }
                if ( classmark.match( 'Stack Large' ) ) {
                    return 'All Stack Large A-Z';
                }
                break;
            case 'brotherton-w3':
                if ( classmark.match( ' A-0\.01' ) ) {
                    return 'Current Periodicals';
                }
                break;
            case 'health-sciences':
                if ( classmark.match( 'Pamphlet' ) ) {
                    return 'Pamphlets';
                } else {
                    var classmark_parts = classmark.match( /.* (Abstract|AVC|BF|BL|BM|GN|HM|HV|Pamphlets|Periodicals|Psychology|QA|QB|QC|QD|QH|QL|QP|QS|QT|QU|QV|QW|QY|QZ|Reference|Requested Items|Statistics|WA|WB|WC|WD|WE|WF|WG|WH|WI|WJ|WK|WL|WM|WN|WO|WP|WQ|WR|WS|WT|WU|WV|WW|WX|WY|WZ|Q|Z|W) .*/ );
                    if ( classmark_parts !== null ) {
                        return classmark_parts[1];
                    }
                }
                break;
        }
    }
    return classmark;
}