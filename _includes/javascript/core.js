

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
                        fplog( 'addFloorLayer - GeoJSON loaded for ' + floor.floorname );
                        floor.features = L.geoJSON( data, {
                            /**
                             * Add event handlers to features, and collect the features
                             * in arrays so we can build the selecters
                             */
                            onEachFeature: function( feature, layer ) {
                                layer.id = feature.properties.type + feature.id;
                                if ( ! floor.selecters.hasOwnProperty(feature.properties.type) ) {
                                    floor.selecters[feature.properties.type] = [];
                                }
                                floor.selecters[feature.properties.type].push( { 'value': layer.id, 'label': feature.properties.name, 'desc': feature.properties.desc, 'class': feature.properties.class } );
                                layer.bindPopup( buildFeaturePopup(feature), { className: 'feature-tooltip' } );
                                layer.on({
                                    mouseover: highlightFeature,
                                    focus: highlightFeature,
                                });
                            },
                            /* style each feature and add appropriate className */
                            style: function( feature ) {
                                let op = 0;
                                if ( feature.properties.type !== 'area' ) {
                                    op = 0.5;
                                }
                                return {
                                    weight: 0,
                                    opacity: 0,
                                    fillOpacity: op,
                                    className: feature.properties.class
                                };
                            }
                        });
                        /* add the features geoJSON layer to the LayerGroup */
                        floorlayer.addLayer( floor.features );
                        fplog( "Added shelf features for "+floor.floorname );
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
        if ( s.label.match( shelfName) ) {
            selectFeature( s.value );
        }
    });
}

/**
 * Highlights a feature on the plan
 * @param {Event} e 
 */
function highlightFeature( e ) {
    resetFeatures();
    let layer = e.target;
    if ( layer.id ) {
        layer.setStyle({ fillOpacity: 0.75 } );
    }
    // GeoJSON multiple polygons
    if ( layer.feature && layer.feature.geometry && layer.feature.geometry.coordinates && layer.feature.geometry.coordinates.length > 1 ) {
        // not sure how to handle this!
        if ( e.latLng ) {
            layer.openPopup( e.latlng );
        } else {
            layer.openPopup();
        }
        // layer.openPopup( polylabel( layer.feature.geometry.coordinates ) );
    } else {
        if ( e.latLng ) {
            layer.openPopup( e.latlng );
        } else {
            layer.openPopup();
        }
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
                layer.setStyle({ fillOpacity: 0.5 } );
            }
        });
    }
}
