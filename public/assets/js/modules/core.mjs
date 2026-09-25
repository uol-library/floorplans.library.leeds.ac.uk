import {
    Map as LeafletMap,
    CRS,
    Control,
    LatLngBounds,
    ImageOverlay,
    LayerGroup,
    GeoJSON,
    Polygon,
    SVGOverlay
} from 'leaflet';
import { floorplans } from './config.mjs';
import {
    getJSON,
    fplog,
    buildFeaturePopup,
    highlightFeature,
    resetFeatures,
    getSVGIcon,
    selectShelf
} from './utilities.mjs';
import { getStartParams } from './routing.mjs';
import { SelecterControl } from './selectercontrol.mjs';
import { OccupancyControl } from './occupancycontrol.mjs';

/**
 * Builds and initialises the map. Called once, from main.js, on DOMContentLoaded.
 */
export function initMap() {
    /* create the map - disable zoom control so we can add it to top right */
    floorplans.map = new LeafletMap('floorplan', {
        crs: CRS.Simple,
        zoom: floorplans.imgconf.startZoom,
        center: [ floorplans.imgconf.startLat, floorplans.imgconf.startLng ],
        minZoom: floorplans.imgconf.minZoom,
        maxZoom: floorplans.imgconf.maxZoom,
        zoomControl: false
    });
    floorplans.map.attributionControl.setPrefix( '<a href="https://leafletjs.com" target="external" title="A JavaScript library for interactive maps" aria-label="Leaflet - a JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet</a>' );

    /* Add zoom control to top right */
    new Control.Zoom( { position: 'topright' } ).addTo( floorplans.map );

    /* find the maximum image dimensions */
    floorplans.libraries.forEach( lib => {
        lib.floors.forEach( f => {
            floorplans.maxHeight = Math.max( floorplans.maxHeight, f.height );
            floorplans.maxWidth = Math.max( floorplans.maxWidth, f.width );
        });
    });
    /* set the bounds of the map to the longest sides */
    floorplans.mapBounds = new LatLngBounds(
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
    floorplans.selecterControl = new SelecterControl().addTo( floorplans.map );
    /* add the occupancy control (updated when a floor is loaded) */
    floorplans.occupancyControl = new OccupancyControl().addTo( floorplans.map );
    /* load the start floor (from the URL), then preload data for all the other floors */
    let params = getStartParams();
    loadFloor( params.floorid, params.shelfname, true )
    .catch( err => fplog( err.message ) )
    .finally( () => {
        floorplans.libraries.flatMap( lib => lib.floors ).forEach( f => {
            addFloorLayer( f ).catch( err => fplog( err.message ) );
        });
    });
    /* fire loaded event */
    document.dispatchEvent( new Event( 'fpmapready' ) );
}

/**
 * Loads a floor and optionally activates it (adds it to the map in place of the
 * current floor and updates the navigation)
 * @param {String} floorid
 * @param {String} shelfname - shelf to select once the floor is activated
 * @param {Boolean} activate
 * @returns {Promise<Object>} resolves with the floor object
 */
export async function loadFloor( floorid = null, shelfname = null, activate = false ) {
    let floor = floorplans.libraries.flatMap( lib => lib.floors ).find( f => f.floorid === floorid );
    if ( ! floor ) {
        throw new Error( 'Floor not found ' + floorid );
    }
    if ( activate ) {
        /* remember the latest floor requested, in case another is requested while this one loads */
        floorplans.requestedFloor = floorid;
    }
    let floorlayer = await addFloorLayer( floor );
    if ( activate && floorplans.requestedFloor === floorid ) {
        /* swap the current floor for this one */
        if ( floorplans.currentFloor && floorplans.currentFloor !== floor ) {
            floorplans.currentFloor.floorlayer.remove();
        }
        floorlayer.addTo( floorplans.map );
        floorplans.currentFloor = floor;
        /* position floor */
        floorplans.map.fitBounds( floor.imageBounds );
        floorplans.map.setView( floor.imageBounds.getCenter() );
        /* build the feature lists and select the floor in the selecter */
        floorplans.selecterControl.buildLists( floorid ).selectFloor( floorid );
        /* find the shelf for the classmark */
        if ( shelfname ) {
            selectShelf( floor, shelfname );
        }
        document.dispatchEvent( new CustomEvent( 'fpfloorloaded', { detail: { floor: floor, layer: floorlayer } } ) );
        fplog( 'Activated floor ' + floor.floorname );
    }
    return floor;
}

/**
 * Main function to add floor layers. The promise is stored on the floor so
 * the image and geoJSON are only fetched once, however many times this is
 * called (it is cleared if loading fails so it can be retried)
 * @param {Object} floor
 * @returns {Promise}
 */
export function addFloorLayer( floor ) {
    if ( ! floor.layerPromise ) {
        floor.layerPromise = buildFloorLayer( floor ).catch( err => {
            delete floor.layerPromise;
            throw err;
        });
    }
    return floor.layerPromise;
}

/**
 * Fetches the image and geoJSON for a floor and constructs the floor layers
 * @param {Object} floor
 * @returns {Promise}
 */
function buildFloorLayer( floor ) {
    return new Promise( ( resolve, reject ) => {
        /* get the image */
        let im = new Image();
        /* set the map bounds */
        floor.imageBounds = new LatLngBounds(
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
            let floorimg = new ImageOverlay( floor.imageurl, floor.imageBounds );
            let floorlayer = new LayerGroup([floorimg]);

            getJSON({
                "url": floor.dataurl,
                "key": floor.floorid
            })
            .then( data => {
                floor.selecters = {};
                floor.iconlayer = new LayerGroup();
                fplog( 'addFloorLayer - GeoJSON loaded for ' + floor.floorname );
                floor.features = new GeoJSON( data, {
                    /**
                     * Add event handlers to features, and collect the features
                     * in arrays so we can build the selecters
                     */
                    onEachFeature: function( feature, layer ) {
                        layer.id = feature.properties.type + feature.id;
                        /**
                         * Add icons to features on the map. These are SVG overlays which are positioned
                         * in the centre of each GeoJSON Polygon. At the moment, this accesses the _latlngs
                         * property of the layer (which I presume is intended to be private) so it would
                         * be good to use another means to loop through GeoJSON features which are comprised
                         * of multiple polygons.
                         */
                        let featureIcon = feature.properties.hasOwnProperty('icon') ? feature.properties.icon : false;
                        if ( feature.properties.type === 'service' && featureIcon ) {
                            layer._latlngs.forEach(pp => {
                                let poly = new Polygon(pp);
                                let polyBounds = poly.getBounds();
                                let polyCentre = polyBounds.getCenter();
                                let polyCentrePoint = floorplans.map.latLngToContainerPoint(polyCentre);
                                let topLeftPoint = polyCentrePoint.add({x: -2.5, y: -2.5});
                                let bottomRightPoint = polyCentrePoint.add({x: 2.5, y: 2.5});
                                let svgBounds = new LatLngBounds( floorplans.map.containerPointToLatLng(topLeftPoint), floorplans.map.containerPointToLatLng(bottomRightPoint) );
                                floor.iconlayer.addLayer( new SVGOverlay(getSVGIcon(featureIcon), svgBounds) );
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
                            pointerover: highlightFeature,
                            focus: highlightFeature,
                            pointerout: resetFeatures,
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
            })
            .catch( err => {
                fplog( 'addFloorLayer - error loading GeoJSON for ' + floor.floorname + ': ' + err.status + ' - ' + err.statusText );
                reject( new Error( 'Failed to load GeoJSON for ' + floor.floorname + ': ' + err.status + ' - ' + err.statusText ) );
            });
        }
        im.onerror = () => reject( new Error( 'Failed to load image ' + floor.imageurl ) );
        im.src = floor.imageurl;
    });
}
