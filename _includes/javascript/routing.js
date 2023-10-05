/**
 * Functions to help with routing:
 * - what to load into the app initially
 * - changing the URI of the app for different views
 * 
 * Primo creates links like this:
 * https://floorplans.library.leeds.ac.uk/floorplan?library=LL&classmark=Sociology+A-0.06+DUR%2FG&floor=ll3
 */

function getStartParams() {
    let params = {
        library: false,
        floorid: false,
        shelfid: false,
        shelfname: false,
        classmark: false,
        search: false
    }
    if ( window.location.search ) {
        const searchParams = new URLSearchParams( window.location.search );
        params.search = searchParams.toString();
        if ( searchParams.has( 'path' ) ) {
            let pathParams = searchParams.get( 'path' ).split('/');
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
                    let floorName = pathParams[2];
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
            }
        }
        if ( searchParams.has( 'classmark' ) ) {
            params.classmark = normaliseClassmark( searchParams.get( 'classmark' ) );
            let feature = getFeatureFromClassmark( params.library, params.classmark );
            if ( feature ) {
                if ( ! params.floorid ) {
                    params.floorid = feature.floorid;
                }
                params.shelfid = feature.featureid;
                params.shelfname = feature.name;
            }
        }
    }
    console.log(params);
    return params;
}

/**
 * Loads a floor when the application loads. The floor to load is determined by
 * getStartParams()
 */
function loadStartFloor() {
    let params = getStartParams();
    let foundFloor = false;
    if ( params.floorid ) {
        floorplans.imagelayers.forEach( lib => {
            lib.floors.forEach( floor => {
                if ( floor.floorid === params.floorid ) {
                    /* floor found - load data for floor */
                    foundFloor = true;
                    addFloorLayer( floor ).then( ( floorlayer ) => {
                        buildFeatureSelects( floor );
                        sortFeatureSelects( floor );
                        /* add the floor to the map */
                        floorlayer.addTo( floorplans.map );
                        /* select the floor in the select list */
                        selectFloor( params.floorid );
                        /* find the shelf for the classmark */
                        selectShelf( floor, params.shelfname )
                        /* load data for all the other floors */
                        floorplans.imagelayers.forEach( l => {
                            l.floors.forEach( f => {
                                addFloorLayer( f );
                            });
                        });
                    });
                }
            });
        });
    }
    if ( ! foundFloor ) {
        /* no start floor - just load data for all floors */
        floorplans.imagelayers.forEach( l => {
            l.floors.forEach( f => {
                addFloorLayer( f );
            });
        });
    }
}

function selectFloor( floorid ) {
    let sel = document.getElementById( 'floorselecter' );
    if ( sel ) {
        for (var i = 0; i < sel.options.length; i++) {
            if ( sel.options[i].value === floorid ) {
                sel.options[i].selected = true;
            }
        }
    }
}

function selectShelf( floor, classmark ) {
    floor.selecters.shelf.forEach( s => {
        if ( s.label.match( classmark ) ) {
            selectFeature( s.value );
        }
    });
}

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
function getFeatureFromClassmark( library, classmark ) {
    let features = getFeatures();
    let ret = false;
    for ( let i = 0; i < features.length; i++ ) {
        let libraryRE = '^'+library + '.*$';
        if ( features[i][1].match( libraryRE ) ) {
            let featureRE = getFeatureRegex( features[i][0] );
            if ( classmark.match( featureRE ) ) {
                let featureDetails = features[i][1].split( '-' );
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
function getFeatureRegex( term ) {
    // replace some characters in classmarks
    term = term.replaceAll( '/(\[|\])/', '' );
    // split comma-separated lists to match any of the parts
    if ( term.indexOf(', ') !== -1 ) {
        term = '(' + ( term.split( ', ' ).join( '|' ) ) + ')';
    }
    return '^' + term + '.*$';
}
function normaliseClassmark( classmark ) {
    if ( classmark.match( '^Video' ) ) {
        return 'DVD';
    }
    return classmark;
}