

canUseLocalStorage = function() { return false };

document.addEventListener( "DOMContentLoaded", function() {
	/* create the map - disable zoom control so we can add it to top right */
	floorplans.map = new L.Map('floorplan', {
		crs: L.CRS.Simple,
		zoom: floorplans.imgconf.startZoom,
		center: [ floorplans.imgconf.startLat, floorplans.imgconf.startLng ],
		minZoom: floorplans.imgconf.minZoom,
		maxZoom: floorplans.imgconf.maxZoom,
		zoomControl: false,
		paddingTopLeft: floorplans.imgconf.paddingTopLeft
	});
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
	/* add a little padding */
	floorplans.maxBounds = floorplans.mapBounds.pad( 0.1 );
	/* set the max bounds so images bounce back */
	floorplans.map.setMaxBounds( floorplans.maxBounds );
	/* pan to the centre - not sure if this is needed */
	floorplans.map.panTo( floorplans.map.unproject( [ ( floorplans.maxWidth / 2 ), ( floorplans.maxHeight / 2 ) ], floorplans.imgconf.maxZoom ) );
	/* zoommap to fit */
	floorplans.map.fitBounds( floorplans.mapBounds );
	if ( floorplans.conf.debug ) {
		floorplans.map.on("click", function(e) {
			console.log(e.latlng.lng + ", " + e.latlng.lat);
		});
	}
	/* add the library selecter control */
	setupSelecterControl();
	/* load the starting floor (if there is one) */
	loadStartFloor();
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
            splog( 'addFloorLayer - floor layer already present for ' + floor, 'core.js' );
            resolve( floor.floorlayer );
        });
    } else {
        /* new floor - need to fetch the image and geoJSON and construct the floor layers */
        return new Promise( ( resolve, reject ) => {
            /* get the image */
            let im = new Image();
            im.src = floor.imageurl;
            floor.imageBounds = [
                floorplans.map.unproject([ 0, 0 ], floorplans.imgconf.maxZoom),
                floorplans.map.unproject([ floor.width, floor.height ], floorplans.imgconf.maxZoom)
            ];
            /**
             * When the image has loaded, add it to an imageOverlay, then
             * add that to a LayerGroup, then get the features geoJSON and
             * add that
             */
            im.onload = function() {
                splog( 'addFloorLayer - image loaded for ' + floor.floorname, 'core.js' );
                let floorimg = L.imageOverlay( floor.imageurl, floor.imageBounds );
                let floorlayer = L.layerGroup([floorimg]);
                
                getJSON({
                    "url": floor.dataurl,
                    "key": floor.floorid,
                    "callback": function( data ) {
                        let shelfClassID = 1;
                        let featureClass = 'leaflet-interactive';
                        floor.selecters = { "shelf": [], "location": [] };
                        splog( 'addFloorLayer - GeoJSON loaded for ' + floor.floorname, 'core.js' );
                        floor.features = L.geoJSON( data, {
                            /**
                             * Add event handlers to features, and collect the features
                             * in arrays so we can build the selecters
                             */
                            onEachFeature: function( feature, layer ) {
                                if ( feature.properties.type == 'shelf' ) {
                                    layer.id = 'shelf' + feature.id;
                                    floor.selecters.shelf.push( { 'value': layer.id, 'label': feature.properties.name, 'class': feature.properties.class } );
                                } else if ( feature.properties.type == 'location' ) {
                                    layer.id = 'location' + feature.id;
                                    floor.selecters.location.push( { 'value': layer.id, 'label': feature.properties.name, 'class': feature.properties.class } );
                                }
                                layer.bindPopup( feature.properties.name, { className: 'feature-tooltip' } );
                                layer.on({
                                    mouseover: highlightFeature,
                                    mouseout: resetFeature,
                                    focus: highlightFeature,
                                    blur: resetFeature
                                });
                            },
                            /* style each feature and add appropriate className */
                            style: function( feature ) {
                                let op = 0.5;
                                if ( feature.properties.type == 'location' ) {
                                    op = 0;
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
                        splog( "Added shelf features for "+floor.floorname , 'refactor.js' );
                        /* store the LayerGroup in the floor object for later... */
                        floor.floorlayer = floorlayer;
                        /* return the LayerGroup */
                        resolve( floorlayer );
                    }
                });
            }
        });
    }
};

/**
 * Highlights a feature on the plan
 * @param {Event} e 
 */
function highlightFeature( e ) {
    let layer = e.target;
    if ( layer.id && layer.feature.properties.type == 'shelf' ) {
        layer.setStyle({ fillOpacity: 0.75 } );
    } else if ( layer.id && layer.feature.properties.type == 'location' ) {
        layer.setStyle({ fillOpacity: 0.4 } );
    }
    if ( e.latlng ) {
        layer.openPopup(e.latlng);
    } else {
        layer.openPopup( polylabel( layer.feature.geometry.coordinates ) );
    }
}

/**
 * Reset the highlight for a feature on the plan
 * @param {Event} e 
 */
function resetFeature( e ) {
    let layer = e.target;
    if ( layer.id && layer.feature.properties.type == 'shelf' ) {
        layer.setStyle({ fillOpacity: 0.5 } );
    } else if ( layer.id && layer.feature.properties.type == 'location' ) {
        layer.setStyle({ fillOpacity: 0 } );
    }
    layer.closePopup();
}
