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

'use strict';
// https://github.com/mourner/tinyqueue
!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?module.exports=i():"function"==typeof define&&define.amd?define(i):t.Queue=i()}(this,function(){"use strict";function t(t,i){return t<i?-1:t>i?1:0}var i=function(i,e){if(void 0===i&&(i=[]),void 0===e&&(e=t),this.data=i,this.length=this.data.length,this.compare=e,this.length>0)for(var n=(this.length>>1)-1;n>=0;n--)this._down(n)};return i.prototype.push=function(t){this.data.push(t),this.length++,this._up(this.length-1)},i.prototype.pop=function(){if(0!==this.length){var t=this.data[0];return this.length--,this.length>0&&(this.data[0]=this.data[this.length],this._down(0)),this.data.pop(),t}},i.prototype.peek=function(){return this.data[0]},i.prototype._up=function(t){for(var i=this.data,e=this.compare,n=i[t];t>0;){var h=t-1>>1,o=i[h];if(e(n,o)>=0)break;i[t]=o,t=h}i[t]=n},i.prototype._down=function(t){for(var i=this.data,e=this.compare,n=this.length>>1,h=i[t];t<n;){var o=1+(t<<1),s=o+1,a=i[o];if(s<this.length&&e(i[s],a)<0&&(o=s,a=i[s]),e(a,h)>=0)break;i[t]=a,t=o}i[t]=h},i});

// https://github.com/mapbox/polylabel
function polylabel(polygon, precision, debug) {
    precision = precision || 1.0;

    // find the bounding box of the outer ring
    var minX, minY, maxX, maxY;
    for (var i = 0; i < polygon[0].length; i++) {
        var p = polygon[0][i];
        if (!i || p[0] < minX) minX = p[0];
        if (!i || p[1] < minY) minY = p[1];
        if (!i || p[0] > maxX) maxX = p[0];
        if (!i || p[1] > maxY) maxY = p[1];
    }

    var width = maxX - minX;
    var height = maxY - minY;
    var cellSize = Math.min(width, height);
    var h = cellSize / 2;

    if (cellSize === 0) {
        var degeneratePoleOfInaccessibility = [minX, minY];
        degeneratePoleOfInaccessibility.distance = 0;
        return degeneratePoleOfInaccessibility;
    }

    // a priority queue of cells in order of their "potential" (max distance to polygon)
    var cellQueue = new Queue(undefined, compareMax);

    // cover polygon with initial cells
    for (var x = minX; x < maxX; x += cellSize) {
        for (var y = minY; y < maxY; y += cellSize) {
            cellQueue.push(new Cell(x + h, y + h, h, polygon));
        }
    }

    // take centroid as the first best guess
    var bestCell = getCentroidCell(polygon);

    // second guess: bounding box centroid
    var bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon);
    if (bboxCell.d > bestCell.d) bestCell = bboxCell;

    var numProbes = cellQueue.length;

    while (cellQueue.length) {
        // pick the most promising cell from the queue
        var cell = cellQueue.pop();

        // update the best cell if we found a better one
        if (cell.d > bestCell.d) {
            bestCell = cell;
            if (debug) console.log('found best %f after %d probes', Math.round(1e4 * cell.d) / 1e4, numProbes);
        }

        // do not drill down further if there's no chance of a better solution
        if (cell.max - bestCell.d <= precision) continue;

        // split the cell into four cells
        h = cell.h / 2;
        cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon));
        cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon));
        cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon));
        cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon));
        numProbes += 4;
    }

    if (debug) {
        console.log('num probes: ' + numProbes);
        console.log('best distance: ' + bestCell.d);
    }

    var poleOfInaccessibility = [bestCell.y, bestCell.x];
    poleOfInaccessibility.distance = bestCell.d;
    return poleOfInaccessibility;
}

function compareMax(a, b) {
    return b.max - a.max;
}

function Cell(x, y, h, polygon) {
    this.x = x; // cell center x
    this.y = y; // cell center y
    this.h = h; // half the cell size
    this.d = pointToPolygonDist(x, y, polygon); // distance from cell center to polygon
    this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(x, y, polygon) {
    var inside = false;
    var minDistSq = Infinity;

    for (var k = 0; k < polygon.length; k++) {
        var ring = polygon[k];

        for (var i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
            var a = ring[i];
            var b = ring[j];

            if ((a[1] > y !== b[1] > y) &&
                (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside;

            minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
        }
    }

    return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// get polygon centroid
function getCentroidCell(polygon) {
    var area = 0;
    var x = 0;
    var y = 0;
    var points = polygon[0];

    for (var i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        var a = points[i];
        var b = points[j];
        var f = a[0] * b[1] - b[0] * a[1];
        x += (a[0] + b[0]) * f;
        y += (a[1] + b[1]) * f;
        area += f * 3;
    }
    if (area === 0) return new Cell(points[0][0], points[0][1], 0, polygon);
    return new Cell(x / area, y / area, 0, polygon);
}

// get squared distance from a point to a segment
function getSegDistSq(px, py, a, b) {

    var x = a[0];
    var y = a[1];
    var dx = b[0] - x;
    var dy = b[1] - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = b[0];
            y = b[1];

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
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
        ta.textContent = JSON.stringify(floorplans.map.pm.getGeomanLayers(true).toGeoJSON(), null, 4);
        L.DomUtil.toFront( exportdiv );
    });
    
    //floorplans.map.pm.enableGlobalRotateMode();
    floorplans.map.pm.addControls();
    floorplans.map.pm.setGlobalOptions({
        snappable: false
    });

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


