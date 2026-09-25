import A11yDialog from 'a11y-dialog';
import { fplog, getJSON } from './utilities.mjs';
import { floorplans } from './config.mjs';

export function initEditor() {
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

    /* add dialog */
    floorplans._dialog = new A11yDialog( document.getElementById('fp-dialog'));

	/* find the maximum image dimensions */
	floorplans.libraries.forEach( lib => {
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
        initialize: function (options) {
            L.Control.prototype.initialize.call(this, options);
            L.setOptions(this, options);
        },
        onAdd: function(map) {
            let controldiv = L.DomUtil.create( 'div', 'floorplan-controls' );
            controldiv.setAttribute( 'id', 'floorplanControls' );
            /* floor selecter drop-down */
            let floorselecter = L.DomUtil.create( 'select', 'selecter__select', controldiv  );
            floorselecter.setAttribute( 'id', 'floorselecter' );
            
            /* build the select list to show all available floors */
            let nullopt = L.DomUtil.create( 'option', '', floorselecter );
            nullopt.textContent = "Select a Library / floor";
            floorplans.libraries.forEach( lib => {
                let optgrp = L.DomUtil.create( 'optgroup', '', floorselecter );
                optgrp.setAttribute( 'label', lib.title );
                lib.floors.forEach( floor => {
                    let flooropt = L.DomUtil.create( 'option', '', optgrp );
                    flooropt.textContent = floor.floorname;
                    flooropt.setAttribute( 'value', floor.floorid );
                });
            });
            L.DomEvent.on( floorselecter, 'change', function(){
                if ( this.options[this.selectedIndex].value !== '' ) {
                    /* remove all layers from map */
                    floorplans.map.eachLayer( function( layer ) {
                        floorplans.map.removeLayer( layer );
                    });
                    /* go through data looking for a floor to match the dropdown value */
                    floorplans.libraries.forEach( lib => {
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

    /* copy button */
    L.Control.copyLoadGeoJSON = L.Control.extend({
        options: {position:'topleft'},
        initialize: function (options) {
            floorplans.copiedIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 600 600"><path fill="#181" d="M7.7 404.606s115.2 129.7 138.2 182.68h99c41.5-126.7 202.7-429.1 340.92-535.1 28.6-36.8-43.3-52-101.35-27.62-87.5 36.7-252.5 317.2-283.3 384.64-43.7 11.5-89.8-73.7-89.84-73.7z"/></svg>';
            floorplans.copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>';
            floorplans.loadIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder2-open" viewBox="0 0 16 16"><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7z"/></svg>';
            document.addEventListener('click', e => {
                if ( e.target.id === 'load_geojson_button' ) {
                    let geojson = document.getElementById( 'load_geojson_text' ).value;
                    let geojsonObj = JSON.parse( geojson );
                    if ( geojson === '' ) {
                        alert( 'Nothing here to load' );
                        return;
                    }
                    if ( document.getElementById( 'replace_current_layers' ).checked ) {
                        floorplans.map.editorLayerGroup.clearLayers();
                    }
                    floorplans.map.editorLayerGroup.addLayer( L.geoJSON( geojsonObj ) );
                    console.log('GeoJSON loaded!');
                    floorplans._dialog.hide();
                }
            });
            L.setOptions(this, options);
        },
        onAdd: function(map) {
            let container = L.DomUtil.create('div', 'leaflet-control-button leaflet-bar fp-button');
            floorplans.copyButton = L.DomUtil.create('button', 'copy__button', container);
            floorplans.copyButton.setAttribute('title','Copy GeoJSON');
            floorplans.copyButton.innerHTML = floorplans.copyIcon;
            L.DomEvent.on(floorplans.copyButton, 'click', function() {
                let geojsonStr = JSON.stringify(floorplans.map.pm.getGeomanLayers(true).toGeoJSON(), null, 4);
                navigator.clipboard.writeText(geojsonStr).then(function() {
                    console.log('GeoJSON copied to clipboard!');
                    floorplans.copyButton.innerHTML = floorplans.copiedIcon;
                    floorplans.copyButton.setAttribute('title','GeoJSON copied to clipboard');
                    setTimeout(() => {
                        floorplans.copyButton.innerHTML = floorplans.copyIcon;
                        floorplans.copyButton.setAttribute('title','Copy GeoJSON');
                    }, 1000);
                }, function(err) {
                    floorplans.copyButton.diabled = true;
                    floorplans.copyButton.setAttribute('title','Copy GeoJSON (disabled)');
                    console.error('Could not copy text: ', err);
                });
            });
            floorplans.loadButton = L.DomUtil.create('button', 'load__button', container);
            floorplans.loadButton.setAttribute('title','Load GeoJSON');
            floorplans.loadButton.innerHTML = floorplans.loadIcon;
            L.DomEvent.on(floorplans.loadButton, 'click', function() {
                let title = document.getElementById('fp-dialog-title');
                title.textContent = "Load GeoJSON";
                let content = document.getElementById('fp-dialog-content');
                content.innerHTML = '<p><label for="load_geojson_text">Load GeoJSON features to edit by copying them into the textbox below</label></p><p><textarea id="load_geojson_text"></textarea></p><div class="form-group"><label><input type="checkbox" id="replace_current_layers"> Replace current editor layers</label><button id="load_geojson_button">Load</button></div>';
                floorplans._dialog.show();
            });
            return container;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    L.control.copyloadgeojson = function(opts) {
        return new L.Control.copyLoadGeoJSON(opts);
    }
    L.control.copyloadgeojson().addTo(floorplans.map);
    
    /* add geoman controls */
    // configure geoman editor
    floorplans.map.editorLayerGroup = L.layerGroup().addTo( floorplans.map );
    floorplans.map.pm.addControls();
    floorplans.map.pm.setGlobalOptions({
        snappable: false,
        layerGroup: floorplans.map.editorLayerGroup
    });
    floorplans.map.pm.addControls({  
        position: 'topright',
    });
    // /* load button */
    // L.Control.loadGeoJSON = L.Control.extend({
    //     options: {position:'topleft'},
    //     initialize: function (options) {
    //         floorplans.loadIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder2-open" viewBox="0 0 16 16"><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7z"/></svg>';
    //         L.setOptions(this, options);
    //         document.addEventListener('click', e => {
    //             if ( e.target.id === 'load_geojson_button' ) {
    //                 let geojson = document.getElementById( 'load_geojson_text' ).value;
    //                 let geojsonObj = JSON.parse( geojson );
    //                 if ( geojson === '' ) {
    //                     alert( 'Nothing here to load' );
    //                     return;
    //                 }
    //                 if ( document.getElementById( 'replace_current_layers' ).checked ) {
    //                     floorplans.pmgroup.clearLayers();
    //                 }
    //                 floorplans.pmgroup.addLayer( L.geoJSON( geojsonObj ) );
    //                 console.log('GeoJSON loaded!');
    //                 floorplans._dialog.hide();
    //             }
    //         });
    //     },
    //     onAdd: function(map) {
    //         let container = L.DomUtil.create('div', 'leaflet-control-button leaflet-bar fp-button' );
    //         floorplans.loadButton = L.DomUtil.create('button', 'load__button', container);
    //         floorplans.loadButton.setAttribute('title','Load GeoJSON');
    //         floorplans.loadButton.innerHTML = floorplans.loadIcon;
    //         L.DomEvent.on(floorplans.loadButton, 'click', function() {
    //             let title = document.getElementById('fp-dialog-title');
    //             title.textContent = "Load GeoJSON";
    //             let content = document.getElementById('fp-dialog-content');
    //             content.innerHTML = '<p><label for="load_geojson_text">Load GeoJSON features to edit by copying them into the textbox below</label></p><p><textarea id="load_geojson_text"></textarea></p><div class="form-group"><label><input type="checkbox" id="replace_current_layers"> Replace current editor layers</label><button id="load_geojson_button">Load</button></div>';
    //             floorplans._dialog.show();
    //         });
    //         return container;
    //     },
    
    //     onRemove: function(map) {
    //         // Nothing to do here
    //     }
    // });
    // L.control.loadgeojson = function(opts) {
    //     return new L.Control.loadGeoJSON(opts);
    // }
    // L.control.loadgeojson().addTo(floorplans.map);
    
    /* fire loaded event */
    document.dispatchEvent( new Event( 'fpmapready' ) );
};
       
        
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
                    "key": floor.floorid
                })
                .then( data => {
                    let shelfClassID = 1;
                    let featureClass = 'leaflet-interactive';
                    floor.selecters = { "shelf": [], "service": [] };
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
                            } else if ( feature.properties.type == 'service' ) {
                                layer.id = 'service' + feature.id;
                                floor.selecters.service.push( { 'value': layer.id, 'label': feature.properties.name, 'class': feature.properties.class } );
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
                            if ( feature.properties.type == 'service' ) {
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
                })
                .catch( reject );
            }
            im.onerror = () => reject( new Error( 'Failed to load image ' + floor.imageurl ) );
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
    } else if ( layer.id && layer.feature.properties.type == 'service' ) {
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
    } else if ( layer.id && layer.feature.properties.type == 'service' ) {
        layer.setStyle({ fillOpacity: 0 } );
    }
    layer.closePopup();
}
