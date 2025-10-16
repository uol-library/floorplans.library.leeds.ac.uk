

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
                                    weight: 0,
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

