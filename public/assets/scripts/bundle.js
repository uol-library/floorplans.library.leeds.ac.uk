/**
 * Creates text for the popups
 */
function buildFeaturePopup( feature ) {
    let popupText = '<strong>' + feature.properties.name + '</strong>';
    if ( feature.properties.desc && feature.properties.desc !== '' ) {
        popupText += '<br>' + feature.properties.desc;
    }
    return popupText;
}

/**
 * Selects a floor from the dropdown list
 * @param {String} floorid
 */
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

/**
 * Selects a feature on the floor from the list of features
 *
 * @uses selectFeature()
 * @param {Object} floor - used to access the lists of features
 * @param {string} shelfName - the Label for the given feature
 */
function selectShelf( floor, shelfName ) {
    floor.selecters.shelf.forEach( s => {
        if ( s.label.match( shelfName ) ) {
            selectFeature( s.value );
        }
    });
}

/**
 * This takes the ID of a feature in a geoJSON layer
 * and returns the layer object which contains the feature
 * @param {String} featureid
 * @returns {Object} layer
 */
function getFeature( featureid ) {
    let feature = false;
    floorplans.map.eachLayer( layer => {
        if ( layer.id && layer.id === featureid ) {
            feature = layer;
        }
    });
    return feature;
}

/**
 * This selects a feature by firing the mouseover event on the feature
 * layer. It then highlights the feature in the selecter control by
 * focussing it.
 */
function selectFeature( featureid ) {
    let layer = getFeature( featureid );
    if ( layer !== false ) {
        layer.fire( 'mouseover', {}, true );
        let fb = document.querySelector('button[data-featureid="'+featureid+'"]');
        if ( fb ) {
            fb.focus();
        }
    }
}

/**
 * Highlights a feature on the plan
 * @param {Event} e
 */
function highlightFeature( e ) {
    resetFeatures();
    let layer = e.target;
    if ( layer.id ) {
        let fb = document.querySelector('button[data-featureid="'+layer.id+'"]');
        if ( fb ) {
            fb.focus();
        }
        if ( layer.id.startsWith('area') ) {
            floorplans.map.closePopup();
            layer.openTooltip();
            layer.setStyle({ fillOpacity: 0.4, opacity: 1 } );
            return;
        } else {
            layer.setStyle({ fillOpacity: 0.75, opacity: 1 } );
        }
    }
    // GeoJSON multiple polygons
    if ( layer.feature && layer.feature.geometry && layer.feature.geometry.coordinates && layer.feature.geometry.coordinates.length > 1 ) {
        // not sure how to handle this!
        if ( e.latlng ) {
            layer.openPopup( e.latlng );
        } else {
            layer.openPopup();
        }
        // layer.openPopup( polylabel( layer.feature.geometry.coordinates ) );
    } else {
        layer.openPopup();
    }
}

/**
 * Reset the highlight for all features on the current floor
 *
 */
function resetFeatures() {
    if ( floorplans.currentFloor && floorplans.currentFloor.features ) {
        floorplans.currentFloor.features.eachLayer( function( layer ) {
            if ( layer.id ) {
                if ( layer.id.startsWith('area') ) {
                    layer.setStyle({ fillOpacity: 0.2, opacity: 0 } );
                } else {
                    layer.setStyle({ fillOpacity: 0.5, opacity: 0 } );
                }
            }
        });
    }
}

/**
 * Get an SVG icon by name
 * @param {String} icon
 * @returns SVG Element or false if not found
 */
function getSVGIcon(icon) {
    if ( floorplans.icons.hasOwnProperty(icon) ) {
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.setAttribute('viewBox', floorplans.icons[icon].viewBox);
        svgElement.innerHTML = floorplans.icons[icon].path;
        return svgElement;
    }
    return false;
}

/**
 * Checks to see if localStorage is available
 * 
 * @param {string} type (localStorage or sessionStorage)
 * @returns {boolean}
 */
 function storageAvailable( type ) {
    if ( ! canUseLocalStorage() ) {
        return false;
    }
    var storage;
    try {
        storage = window[ type ];
        var x = '__storage_test__';
        storage.setItem( x, x );
        storage.removeItem( x );
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            ( storage && storage.length !== 0 );
    }
}

/**
 * Sets a value in localStorage but adds expiry date
 * 
 * @param {string} key localStorage key
 * @param {string} value to set
 * @param {int} ttl Time to live (in hours)
 */
function setWithExpiry( key, value, ttl ) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + ( ttl * 60 * 60 * 1000 ),
    }
    localStorage.setItem( key, JSON.stringify( item ) )
}

/**
 * Gets a value in localStorage but checks expiry date
 * first. If expired, localStorage key is removed and
 * null returned.
 * 
 * @param {string} key localStorage key
 */
function getWithExpiry( key ) {
    const itemStr = localStorage.getItem( key )
    if ( ! itemStr ) {
        return null;
    }
    const item = JSON.parse( itemStr )
    const now = new Date()
    if ( now.getTime() > item.expiry ) {
        localStorage.removeItem( key )
        return null
    }
    return item.value;
}

/**
 * Gets a JSON data file from a remote URL. Utilises localstorage
 * to cache the results.
 * @param {Object} options Information about the JSON file
 * @param {String} options.key Unique key used to store the data in localstorage (required)
 * @param {String} options.url URL of the JSON file (required)
 * @param {Integer} options.expiry How long to cache the results (in hours) default: 24
 * @param {Function} options.callback callback function with one parameter (JSON parsed response)
 */
 function getJSON( options ) {
    if ( ! options.hasOwnProperty( 'key' ) || ! options.hasOwnProperty( 'url' ) ) {
        return;
    }
    if ( ! options.hasOwnProperty( 'expires' ) ) {
        options.expires = 24;
    }
    if ( storageAvailable( 'localStorage' ) && getWithExpiry( options.key ) ) {
        fplog( "getting data '"+options.key+"' from local storage" );
        if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
            options.callback( JSON.parse( getWithExpiry( options.key ) ) );
        }
    } else {
        fplog( "getting data '"+options.key+"' from "+options.url );
        var oReq = new XMLHttpRequest();
        oReq.addEventListener( 'load', function(){
            if ( storageAvailable( 'localStorage' ) ) {
                var expires = new Date().getTime() + ( options.expires * 60 * 60 * 1000 );
                fplog( "storing data '" + options.key + "' in localstorage - expires " + expires );
                setWithExpiry( options.key, this.responseText, options.expires );
            }
            if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
                options.callback( JSON.parse( this.responseText ) );
            }
        });
        oReq.open("GET", options.url);
        oReq.send();
    }
}

/**
 * Logs messages to console if debug flag is set
 * @param {string} message
 */
function fplog( message ) {
    if ( floorplans.conf.debug ) {
        let now = new Date();
        console.log( now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0') + '.' + now.getMilliseconds().toString().padStart(3, '0') + ' ' + message );
    }
}



canUseLocalStorage = function() { return false };

document.addEventListener( "DOMContentLoaded", function() {
	/* create the map - disable zoom control so we can add it to top right */
	floorplans.map = new L.Map('floorplan', {
		crs: L.CRS.Simple,
		zoom: floorplans.imgconf.startZoom,
		center: [ floorplans.imgconf.startLat, floorplans.imgconf.startLng ],
		minZoom: floorplans.imgconf.minZoom,
		maxZoom: floorplans.imgconf.maxZoom,
		zoomControl: false
	});
    floorplans.map.attributionControl.setPrefix( '<a href="https://leafletjs.com" target="external" title="A JavaScript library for interactive maps" aria-label="Leaflet - a JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet</a>' );

	/* Add zoom control to to right */
	L.control.zoom( { position: 'topright' } ).addTo( floorplans.map );
	/* find the maximum image dimensions */
	floorplans.imagelayers.forEach( lib => {
		lib.floors.forEach( f => {
			floorplans.maxHeight = Math.max( floorplans.maxHeight, f.height );
			floorplans.maxWidth = Math.max( floorplans.maxWidth, f.width );
		});
	});
	/* set the bounds of the map to the longest sides */
	floorplans.mapBounds = new L.LatLngBounds(
		floorplans.map.unproject( [ 0, floorplans.maxHeight ], floorplans.imgconf.maxZoom ),
		floorplans.map.unproject( [ floorplans.maxWidth, 0 ], floorplans.imgconf.maxZoom )
	);
    /* show LatLng when map is clicked */
	if ( floorplans.conf.debug ) {
		floorplans.map.on("click", function(e) {
			console.log(e.latlng.lng + ", " + e.latlng.lat);
		});
	}
	/* add the library selecter control */
	setupSelecterControl();
	/* load the starting floor (if there is one) */
	loadStartFloor();
    /* fire loaded event */
    document.dispatchEvent( new Event( 'fpmapready' ) );
});
       
        
/**
 * Main function to add floor layers
 * @param {Object} floor 
 * @returns {Promise}
 */
var addFloorLayer = function( floor ) {
    
    /* first check to see if the floor has layers set up in the UI already */
    if ( floor.floorlayer ) {
        return new Promise( (resolve, reject) => {
            fplog( 'addFloorLayer - floor layer already present for ' + floor );
            resolve( floor.floorlayer );
        });
    } else {
        /* new floor - need to fetch the image and geoJSON and construct the floor layers */
        return new Promise( ( resolve, reject ) => {
            /* get the image */
            let im = new Image();
            /* set the map bounds */
            floor.imageBounds = L.latLngBounds(
                floorplans.map.unproject([ 0, 0 ], floorplans.imgconf.maxZoom),
                floorplans.map.unproject([ floor.width, floor.height ], floorplans.imgconf.maxZoom)
            );
            /**
             * When the image has loaded, add it to an imageOverlay, then
             * add that to a LayerGroup, then get the features geoJSON and
             * add that
             */
            im.onload = function() {
                fplog( 'addFloorLayer - image loaded for ' + floor.floorname );
                let floorimg = L.imageOverlay( floor.imageurl, floor.imageBounds );
                let floorlayer = L.layerGroup([floorimg]);
                
                getJSON({
                    "url": floor.dataurl,
                    "key": floor.floorid,
                    "callback": function( data ) {
                        let shelfClassID = 1;
                        let featureClass = 'leaflet-interactive';
                        floor.selecters = {};
                        floor.iconlayer = L.layerGroup();
                        fplog( 'addFloorLayer - GeoJSON loaded for ' + floor.floorname );
                        floor.features = L.geoJSON( data, {
                            /**
                             * Add event handlers to features, and collect the features
                             * in arrays so we can build the selecters
                             */
                            onEachFeature: function( feature, layer ) {
                                layer.id = feature.properties.type + feature.id;
                                /**
                                 * Add icons to the map
                                 * TODO: This will currently add an icon, but the bounds are not set correctly.
                                 * Ideally the GeoJSON would contain a point feature for each icon, but for now
                                 * we will just use the polygon bounds.
                                 */
                                // if ( feature.properties.type === 'icon' ) {
                                //     floor.iconlayer.addLayer( L.svgOverlay(getSVGIcon(feature.properties.icon), layer._latlngs) );
                                //     return;    
                                // }
                                /**
                                 * Add icons to features on the map. These are SVG overlays which are positioned
                                 * in the centre of each GeoJSON Polygon. At the moment, this accesses the _latlngs
                                 * property of the layer (which I presume is intended to be private) so it would
                                 * be good to use another means to loop through GeoJSON features which are comprised
                                 * of multiple polygons.
                                 */
                                let featureIcon = feature.properties.hasOwnProperty('icon') ? feature.properties.icon : false;
                                if ( feature.properties.type === 'location' && featureIcon ) {
                                    layer._latlngs.forEach(pp => {
                                        let poly = L.polygon(pp);
                                        let polyBounds = poly.getBounds();
                                        let polyCentre = polyBounds.getCenter();
                                        let polyCentrePoint = floorplans.map.latLngToContainerPoint(polyCentre);
                                        let topLeftPoint = polyCentrePoint.add({x: -2.5, y: -2.5});
                                        let bottomRightPoint = polyCentrePoint.add({x: 2.5, y: 2.5});
                                        let svgBounds = L.latLngBounds( floorplans.map.containerPointToLatLng(topLeftPoint), floorplans.map.containerPointToLatLng(bottomRightPoint) );
                                        floor.iconlayer.addLayer( L.svgOverlay(getSVGIcon(featureIcon), svgBounds) );
                                    });
                                }
                                /**
                                 * Build data for the selecters which allow users to select
                                 * features on the plans
                                 */
                                if ( ! floor.selecters.hasOwnProperty(feature.properties.type) ) {
                                    floor.selecters[feature.properties.type] = [];
                                }
                                floor.selecters[feature.properties.type].push( { 'value': layer.id, 'label': feature.properties.name, 'desc': feature.properties.desc, 'icon': featureIcon, 'class': feature.properties.class } );
                                /**
                                 * Add tooltips / popups
                                 */
                                if ( feature.properties.type === 'area' ) {
                                    layer.bindTooltip( buildFeaturePopup(feature), { className: 'area-tooltip' } );
                                } else {
                                    layer.bindPopup( buildFeaturePopup(feature), { className: 'feature-tooltip' } );
                                }
                                /**
                                 * Add interaction highlighting (only when entering the feature - the
                                 * highlighting function needs to reset first)
                                 */
                                layer.on({
                                    mouseover: highlightFeature,
                                    focus: highlightFeature,
                                    mouseout: resetFeatures,
                                    blur: resetFeatures,
                                });
                            },
                            /* style each feature and add appropriate className */
                            style: function( feature ) {
                                return {
                                    opacity: 0,
                                    fillOpacity: ( ( feature.properties.type !== 'area' ) ? 0.5: 0.2 ),
                                    className: feature.properties.class
                                };
                            }
                        });
                        /* add the features geoJSON layer to the LayerGroup */
                        floorlayer.addLayer( floor.features );
                        /* add the SVG Icons layer to the LayerGroup */
                        floorlayer.addLayer( floor.iconlayer );
                        fplog( "Added shelves, features for "+floor.floorname );
                        /* store the LayerGroup in the floor object for later... */
                        floor.floorlayer = floorlayer;
                        /* return the LayerGroup */
                        resolve( floorlayer );
                    }
                });
            }
            im.src = floor.imageurl;
        });
    }
};

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
                        floorplans.currentFloor = floor;
                        /* position floor */
                        floorplans.map.fitBounds( floor.imageBounds );
                        floorplans.map.setView( floor.imageBounds.getCenter() );
                        /* select the floor in the select list */
                        selectFloor( params.floorid );
                        /* find the shelf for the classmark */
                        selectShelf( floor, params.shelfname );
                        showOccupancyMessage( params.floorid );
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
    // special cases
    if ( featureName.startsWith('Modern History A') ) {
        featureName = 'Modern History [A-O]';
    }
    if ( featureName.startsWith('Modern History P') ) {
        featureName = 'Modern History [P-Z]';
    }
    return new RegExp('^' + featureName + '.*$', 'i');
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
    classmark = decodeURIComponent( classmark.replace(/\+/g, '%20') );
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
/**
 * This file contains all the functions used to create the floor selecter control
 * on the floorplans map
 */

/**
 * This sets up the selecter control and adds it to the controls container element
 */
function setupSelecterControl() {
    /**
     * Library selecter control
     * This contains (initially) a drop-down list of library floorplans
     * When one is selected, additional dropdowns will appear for shelves / subjects and 
     * other locations on the floor, built using buildFeatureSelects()
     */
    floorplans.controlsContainer = L.DomUtil.get( 'floorplan-controls' );

    /* title bar */
    let header = L.DomUtil.create( 'h2', 'floorplans-selecter-header', floorplans.controlsContainer );
    header.textContent = 'Library Floorplans Navigation';
    let fs = L.DomUtil.create( 'fieldset', 'floorplans-selecter', floorplans.controlsContainer );
    let ld = L.DomUtil.create( 'legend', 'floorplans-selecter-legend visuallyhidden', fs );
    ld.textContent = 'Floorplan controls';

    floorplans.controls = L.DomUtil.create( 'div', 'floorplans-selecter-content', fs );
    floorplans.controls.setAttribute( 'id', 'floorplans-selecter-controls' );
    
    /* floor selecter drop-down */
    let floorselecterLabel = L.DomUtil.create( 'label', 'selecter__label', floorplans.controls );
    floorselecterLabel.textContent = "Select a Library / floor";
    floorselecterLabel.setAttribute( 'id', 'floorselecterlabel' );
    floorselecterLabel.setAttribute( 'for', 'floorselecter' );
    let floorselecter = L.DomUtil.create( 'select', 'selecter__select', floorplans.controls  );
    floorselecter.setAttribute( 'id', 'floorselecter' );
    
    /* build the select list to show all available floors */
    let nullopt = L.DomUtil.create( 'option', '', floorselecter );
    nullopt.textContent = "Select a Library / floor";
    floorplans.imagelayers.forEach( lib => {
        let optgrp = L.DomUtil.create( 'optgroup', '', floorselecter );
        optgrp.setAttribute( 'label', lib.title );
        lib.floors.forEach( floor => {
            let flooropt = L.DomUtil.create( 'option', '', optgrp );
            flooropt.textContent = floor.floorname;
            flooropt.setAttribute( 'value', floor.floorid );
        });
    });

    /* areas */
    let areaSelecter = L.DomUtil.create( 'div', 'hidden', floorplans.controls );
    areaSelecter.setAttribute( 'id', 'areaselecter' );
    let areaselecterHeading = L.DomUtil.create( 'h3', '', areaSelecter );
    areaselecterHeading.textContent = 'Study Areas';
    /* area selecter list */
    let areaselecterList = L.DomUtil.create( 'ul', 'selecter__list', areaSelecter );
    areaselecterList.setAttribute( 'id', 'areaselecterlist' );

    /* shelf selecter drop-down - subjects */
    let shelfSelecter = L.DomUtil.create( 'div', 'hidden', floorplans.controls );
    shelfSelecter.setAttribute( 'id', 'shelfselecter' );
    let shelfselecterHeading = L.DomUtil.create( 'h3', '', shelfSelecter );
    shelfselecterHeading.textContent = 'Subjects on this floor';
    /* shelf selecter list - subjects */
    let shelfselecterList = L.DomUtil.create( 'ul', 'selecter__list', shelfSelecter );
    shelfselecterList.setAttribute( 'id', 'shelfselecterlist' );
    
    /* location selecter drop-down - areas of interest */
    let locationSelecter = L.DomUtil.create( 'div', 'hidden', floorplans.controls );
    locationSelecter.setAttribute( 'id', 'locationselecter' );
    let locationselecterHeading = L.DomUtil.create( 'h3', '', locationSelecter );
    locationselecterHeading.textContent = 'Also on this floor';
    /* location selecter list - other features on this floor */
    let locationselecterList = L.DomUtil.create( 'ul', 'selecter__list', locationSelecter );
    locationselecterList.setAttribute( 'id', 'locationselecterlist' );

    /* Listen for changes to floor selecter */
    L.DomEvent.on( floorselecter, 'change', function(){
        if ( this.options[this.selectedIndex].value !== '' ) {
            /* remove all layers from map */
            floorplans.map.eachLayer( function( layer ) {
                floorplans.map.removeLayer( layer );
            });
            /* empty the current lists */
            ['areaselecter', 'shelfselecter', 'locationselecter' ].forEach( s => {
                let listcontainer = L.DomUtil.get( s + 'list' );
                if ( listcontainer && listcontainer.hasChildNodes() ) {
                    L.DomUtil.empty( listcontainer );
                }
                L.DomUtil.addClass( L.DomUtil.get( s ), 'hidden' );
            });
            /* go through data looking for a floor to match the dropdown value */
            floorplans.imagelayers.forEach( lib => {
                lib.floors.forEach( floor => {
                    if ( floor.floorid == this.options[this.selectedIndex].value ) {
                        /* add floor layer */
                        addFloorLayer( floor )
                        .then( ( floorlayer ) => {
                            /* build select controls for shelves and locations */
                            buildFeatureSelects( floor );
                            sortFeatureSelects( floor );
                            /* add the floor layer to the map and center it */
                            floorlayer.addTo( floorplans.map );
                            floorplans.currentFloor = floor;
                            floorplans.map.fitBounds( floor.imageBounds );
                            floorplans.map.setView( floor.imageBounds.getCenter() );
                            fplog( 'Added layer for floor '+floor.floorname );
                        });
                    }
                });
            });
        }
    });

    /* activate the menu button to allow the selecter to be shuffled off screen */
    var menuButton = document.getElementById( 'menu-close-button' );
    var menuContainer = document.getElementById( 'floorplan-controls' );
    menuButton.addEventListener( 'click', e => {
        if ( menuButton.classList.contains( 'close' ) ) {
            menuButton.classList.remove( 'close' );
            menuContainer.classList.add( 'closed' );
        } else {
            menuButton.classList.add( 'close' );
            menuContainer.classList.remove( 'closed' );
        }
    });
}

/**
 * This builds lists for features (shelves and locations added in geoJSON layers)
 * which are added to the libraryselecter control
 * @param {Object} floor 
 */
function buildFeatureSelects( floor ) {
    for ( s in floor.selecters ) {
        /* get the container and the list */
        let listcontainer = L.DomUtil.get( s + 'selecter' );
        let list = L.DomUtil.get( s + 'selecterlist' );

        /**
         * The floor.selecters object is built by addFloorLayer() and contains two
         * properties (shelf and location) which are used to build two lists of
         * buttons in the control
         */
        if ( floor.selecters[s].length ) {
            floor.selecters[s].forEach( o => {
                let itemli = L.DomUtil.create('li', 'item-' + s, list );
                itemli.setAttribute( 'data-sortkey', o.label.toLowerCase().replace( /\W/g, '' ).replace( /(8|13)([1-9])$/, '$10$2' ) );
                let itemClass = s+'button ' + o.class;
                if ( o.icon && o.icon !== '' ) {
                    itemClass += ' icon-' + o.icon;
                }
                let itembutton = L.DomUtil.create('button', itemClass, itemli );
                itembutton.innerText = o.label;
                itembutton.setAttribute( 'data-featureid', o.value );
                /* add event to highlight a feature */
                L.DomEvent.on( itembutton, 'focus mouseover', function(e) {
                    let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                    layer.fire( 'mouseover', {}, true );
                });
                /* add event to remove highlight */
                L.DomEvent.on( itembutton, 'blur mouseout', function(e) {
                    let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                    layer.fire( 'mouseout', {}, true );
                });
                if ( o.desc && o.desc !== '' && !o.icon ) {
                    itembutton.title = o.desc;
                    //let desc = L.DomUtil.create('span', 'feature-description', itemli );
                    //desc.innerText = o.desc;
                }
            });
            /* show the selecter */
            L.DomUtil.removeClass( listcontainer, 'hidden' );
        }
    }
}

/**
 * This sorts the features in a floor's selecters according
 * to the data-sortkey attribute
 * @param {Object} floor 
 */
function sortFeatureSelects( floor ) {
    for ( s in floor.selecters ) {
        let list = L.DomUtil.get( s + 'selecterlist' );
        let sortkeys = [];
        list.querySelectorAll('li').forEach( el => {
            sortkeys.push( el.getAttribute('data-sortkey'));
        });
        sortkeys.sort();
        sortkeys.forEach( key => {
            let li = list.querySelector('[data-sortkey="'+key+'"]');
            list.appendChild(li);
        });
    }
}


/**
 * Displays occupancy data for two libraries
 * Set up data container
 */
floorplans.occupancyData = {
    "Edward Boyle": {
        "floorid": "edwardboyle",
        "capacity": 1800,
        "occupancy": 0
    },
    "Laidlaw": {
        "floorid": "laidlaw",
        "capacity": 640,
        "occupancy": 0
    }
};

/**
 * Adds a control to the floorplans to display occupancy
 */
document.addEventListener( 'fpmapready', e => {
    L.Control.Occupancy = L.Control.extend({
        onAdd: function(map) {
            let c = L.DomUtil.create( 'div', 'hidden' );
            c.setAttribute( 'id', 'occupancyContainer' );
            for( lib in floorplans.occupancyData ) {
                L.DomUtil.create( 'p', 'hidden '+floorplans.occupancyData[lib].floorid+'msg', c );
            }
            return c;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    
    L.control.occupancy = function( opts ) {
        return new L.Control.Occupancy( opts );
    }
    
    L.control.occupancy({ position: 'topleft' }).addTo( floorplans.map );

    updateOccupancy();
    setInterval( updateOccupancy, 60000 );
});
/**
 * get occupancy data from remote JSON file and update 
 * spacefinder.occupancyData
 */
function updateOccupancy() {
    fplog( 'updateOccupancy' );
    let options = {
        url: "https://floorplans.library.leeds.ac.uk/capacity.json",
        key: "libraryOccupancy",
        expires: 0.015,
        callback: function( data ) {
			for( lib in floorplans.occupancyData ) {
				if ( data.hasOwnProperty( lib ) ) {
                    fplog( 'Updating occupancy for spaces in '+lib+' to '+data[lib].occupancy );
                    floorplans.occupancyData[lib].occupancy = parseInt(data[lib].occupancy);
                    floorplans.occupancyData[lib].capacity = parseInt(data[lib].capacity);
                    let msgObj = document.querySelector('.'+floorplans.occupancyData[lib].floorid+'msg');
                    let occupancyMsg = floorplans.occupancyData[lib].occupancy < 50? "fewer than 50": floorplans.occupancyData[lib].occupancy.toLocaleString('en');
                    let capacityMsg = floorplans.occupancyData[lib].capacity.toLocaleString('en')
                    msgObj.innerHTML = 'There are currently <strong>'+occupancyMsg+'</strong> people in the <strong>'+lib+' library</strong>, which has a seating capacity of approximately <strong>'+capacityMsg+'</strong>';
				} else {
                    fplog("No occupancy data for "+lib);
                }
			}
        }
    }
    getJSON( options );
}

document.addEventListener( 'DOMContentLoaded', () => {
    L.DomEvent.on( floorselecter, 'change', function(){
        let c = document.getElementById('occupancyContainer');
        if ( this.options[this.selectedIndex].value !== '' ) {
            let floorid = this.options[this.selectedIndex].value;
            showOccupancyMessage( floorid );
        }
    });
});

function showOccupancyMessage( floorid ) {
    let c = document.getElementById('occupancyContainer');
    if ( floorid.match( '(edward|laidlaw)' ) ) {
        c.classList.remove('hidden');
        let activemsg, inactivemsg;
        if ( floorid.match( 'edward' ) ) {
            activemsg = document.querySelector('.edwardboylemsg');
            inactivemsg = document.querySelector('.laidlawmsg');
        } else {
            inactivemsg = document.querySelector('.edwardboylemsg');
            activemsg = document.querySelector('.laidlawmsg');
        }
        inactivemsg.classList.add('hidden');
        activemsg.classList.remove('hidden');
    } else {
        c.classList.add('hidden');
    }
}
