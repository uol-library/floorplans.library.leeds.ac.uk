/**
 * Editor to allow definition of shelf polygons using Leaflet GeoMan plugin
 * Loads an SVG file for the floor, then provides tools to define polygons
 * and export GeoJSON for them, and load existing GeoJSON
 */
document.addEventListener( "maploaded", function() {
	if ( document.getElementById( 'floorplan' ).classList.contains( 'editor' ) ) {
		console.log( 'loading geoJSON editor' );
		// FeatureGroup is to store editable layers
		floorplans.shelves = new L.geoJSON();
		floorplans.map.addLayer( floorplans.shelves );
		floorplans.map.pm.setGlobalOptions( { layerGroup: floorplans.shelves } );
		/* add export button control */
		L.Control.Exportbtn = L.Control.extend({
			onAdd: function(map) {
				let dialog = new A11yDialog( L.DomUtil.get( 'geojson-input' ) );
				let dialogTitle = L.DomUtil.get( 'geojson-input-title' );
				let loadbutton = L.DomUtil.get( 'geojson-input-load' );
				let target = L.DomUtil.get( 'geojson-input-textarea' );
				let container = L.DomUtil.create( 'div' );
				L.DomUtil.addClass( container, 'leaflet-import-export' );
				let importbutton = L.DomUtil.create( 'button', 'leaflet-import-export-button', container );
				importbutton.setAttribute( 'id', 'geojsonimport' );
				importbutton.setAttribute( 'title', 'Import GeoJSON' );
				importbutton.innerText = 'import';
				let exportbutton = L.DomUtil.create( 'button', 'leaflet-import-export-button', container );
				exportbutton.setAttribute( 'id', 'geojsonexport' );
				exportbutton.setAttribute( 'title', 'Export GeoJSON' );
				exportbutton.innerText = 'export';
				exportbutton.addEventListener( 'click', function(e) {		
					L.DomUtil.addClass( loadbutton, 'visuallyhidden' );
					dialogTitle.innerText = 'GeoJSON export';
					target.value = '';
					let data = floorplans.shelves.toGeoJSON();
					target.value = JSON.stringify( data, null, 4 );
					dialog.show();
				});
				importbutton.addEventListener( 'click', function(e) {
					L.DomUtil.removeClass( loadbutton, 'visuallyhidden' );
					dialogTitle.innerText = 'GeoJSON import';
					target.value = '';
					dialog.show();
				});
				loadbutton.addEventListener( 'click', function(e) {
					console.log( target.value );
					try {
						let gj = JSON.parse( target.value );
						floorplans.shelves.clearLayers();
						floorplans.shelves.addData( gj );
					} catch (e) {
						console.log( e );
					}
					dialog.hide();
				});
				return container;
			},
			onRemove: function(map) {
				// Nothing to do here
			}
		});
		L.control.exportbtn = function(opts) {
			return new L.Control.Exportbtn(opts);
		}
		L.control.exportbtn({ position: 'topright' }).addTo(floorplans.map);
		/* add leaflet drawing toolbar */
		floorplans.map.pm.addControls({  
			position: 'topright', 
			drawText: false,
			drawMarker: false,
			drawCircleMarker: false
		}); 
		floorplans.map.on('pm:create', function(e) {
			console.log(e);
		});
		getSVG( floorplans.conf.svg.url, function( SVGElement ) {
			let s = L.svgOverlay( SVGElement, floorplans.conf.svg.bounds, { opacity: 0.5 } ).addTo( floorplans.map );
			floorplans.layercontrol.addOverlay( s, floorplans.conf.svg.name );
		});
		getSVG( floorplans.conf.svg1.url, function( SVGElement ) {
			let s = L.svgOverlay( SVGElement, floorplans.conf.svg1.bounds, { opacity: 0.5 } ).addTo( floorplans.map );
			floorplans.layercontrol.addOverlay( s, floorplans.conf.svg1.name );
		});
		getSVG( floorplans.conf.svg2.url, function( SVGElement ) {
			let s = L.svgOverlay( SVGElement, floorplans.conf.svg2.bounds, { opacity: 0.5 } ).addTo( floorplans.map );
			floorplans.layercontrol.addOverlay( s, floorplans.conf.svg2.name );
		});
	}
});