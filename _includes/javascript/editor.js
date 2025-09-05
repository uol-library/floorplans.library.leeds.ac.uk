

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
    L.Control.FloorSelecter = L.Control.extend({
        onAdd: function(map) {
            let controldiv = L.DomUtil.create( 'div', 'floorplan-controls' );
            /* floor selecter drop-down */
            let floorselecter = L.DomUtil.create( 'select', 'selecter__select', controldiv  );
            floorselecter.setAttribute( 'id', 'floorselecter' );
            /* export button */
            let exportbutton = L.DomUtil.create( 'button', 'export__button', controldiv  );
            exportbutton.setAttribute( 'id', 'exportbutton' );
            exportbutton.textContent = "Export";
            
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
            return controldiv;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    L.control.floorselecter = function(opts) {
        return new L.Control.FloorSelecter(opts);
    }
    L.control.floorselecter({ position: 'topleft' }).addTo(floorplans.map);
    /* Listen for changes to floor selecter */
    L.DomEvent.on( floorselecter, 'change', function(){
        if ( this.options[this.selectedIndex].value !== '' ) {
            /* remove all layers from map */
            floorplans.map.eachLayer( function( layer ) {
                floorplans.map.removeLayer( layer );
            });
            /* go through data looking for a floor to match the dropdown value */
            floorplans.imagelayers.forEach( lib => {
                lib.floors.forEach( floor => {
                    if ( floor.floorid == this.options[this.selectedIndex].value ) {
                        /* add floor layer */
                        addFloorLayer( floor )
                        .then( ( floorlayer ) => {
                            /* add the floor layer to the map and center it */
                            floorlayer.addTo( floorplans.map );
                            floorplans.map.fitBounds( floor.imageBounds );
                            floorplans.map.setView( floor.imageBounds.getCenter() );
                            fplog( 'Added layer for floor '+floor.floorname );
                        });
                    }
                });
            });
        }
    });
    /* Listen for changes to floor selecter */
    L.DomEvent.on( L.DomUtil.get('exportbutton'), 'click', function() {
        let exportdiv = L.DomUtil.create( 'div', 'exchange-overlay', L.DomUtil.get('maincontainer') );
        /* close button */
        let closeButton = L.DomUtil.create( 'button', 'btn-menu close', exportdiv );
        closeButton.setAttribute( 'id', 'menu-close-button' );
        L.DomUtil.create( 'span', 'icon', closeButton );
        let closeLabel = L.DomUtil.create( 'span', 'visuallyhidden', closeButton );
        closeLabel.textContent = 'Close';
        closeButton.addEventListener( 'click', e => {
            L.DomUtil.remove( exportdiv );
        });
        let ta = L.DomUtil.create( 'textarea', 'geojson-container', exportdiv );
        ta.textContent = JSON.stringify(floorplans.map.pm.getGeomanLayers(true).toGeoJSON());
        L.DomUtil.toFront( exportdiv );
    });
    
    floorplans.map.pm.addControls();

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
                        floor.selecters = { "shelf": [], "location": [] };
                        fplog( 'addFloorLayer - GeoJSON loaded for ' + floor.floorname );
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
                                    click: makeFeatureEditable,
                                    popupclose: makeFeaturesNonEditable
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
                        floor.features.options.pmIgnore = false;
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
    return;
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

function makeFeatureEditable( e ) {
    // console.log(e.target.pm.getOptions());
    // return;

    let layer = e.target;
    layer.options.pmIgnore = false;
    L.PM.reInitLayer(layer);
}
function makeFeaturesNonEditable( e ) {
    // console.log(e.target);
    // return;
    floorplans.map.eachLayer(layer => {
        layer.options.pmIgnore = true;
    });
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
