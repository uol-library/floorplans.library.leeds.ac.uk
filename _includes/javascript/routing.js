/**
 * Functions to help with routing:
 * - what to load into the app initially
 * - changing the URI of the app for different views
 */

function getStartParams() {
    let params = {
        floorid: false,
        classmark: false
    }
    if ( window.location.search ) {
        const searchParams = new URLSearchParams( window.location.search );
        if ( searchParams.has( 'path' ) ) {
            let pathParams = searchParams.get( 'path' ).split('/');
            if ( pathParams.length >= 3 && "brotherton" === pathParams[0] && ["m1", "m2", "m3", "m4", "w2", "w3"].indexOf( pathParams[2] ) !== -1 ) {
                params.floorid = pathParams[0]+'-'+pathParams[2];
            } else if ( pathParams.length >= 3 && "edwardboyle" === pathParams[0] && parseInt( pathParams[2] ) >= 8 && parseInt( pathParams[2] ) <= 13 ) {
                params.floorid = pathParams[0]+'-'+pathParams[2];
            } else if ( "healthsciences" === pathParams[0] ) {
                params.floorid = 'health-sciences';
            } else if ( pathParams.length >= 3 && "laidlaw" === pathParams[0] && ["ground", "first", "second", "third"].indexOf( pathParams[2] ) !== -1 ) {
                params.floorid = pathParams[0]+'-'+pathParams[2];
            }
        }
        if ( searchParams.has( 'classmark' ) ) {
            params.classmark = decodeURIComponent( searchParams.get( 'classmark' ) );
        }
    }
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
                        selectShelf( floor, params.classmark )
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