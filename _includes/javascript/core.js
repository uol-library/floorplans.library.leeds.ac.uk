

document.addEventListener( "DOMContentLoaded", function() {
	if ( document.getElementById( 'floorplan' ).className.indexOf( 'refactor' ) === -1 ) {
		floorplans.osm = L.tileLayer(
			'//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{
				maxZoom: floorplans.conf.maxZoom,
				attribution: "Map data &copy; OpenStreetMap contributors"
			}
		);
		floorplans.esri_sat = L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{
				maxZoom: 19,
				attribution: 'Tiles © Esri - Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			}
		);
		floorplans.map = new L.Map('floorplan', {
			layers: [floorplans.esri_sat,floorplans.osm],
			center: new L.LatLng( floorplans.conf.startLat, floorplans.conf.startLng ),
			zoom: floorplans.conf.startZoom,
			minZoom: floorplans.conf.minZoom,
			maxZoom: floorplans.conf.maxZoom
		});
		// add layers control
		floorplans.layercontrol = L.control.layers(
			{ 'Satellite': floorplans.esri_sat, 'OpenStreetMap': floorplans.osm },
			null,
			{position: 'topleft'}
		);
		floorplans.layercontrol.addTo( floorplans.map );
		floorplans.map.on("click", function(e) {
			console.log(e.latlng.lng + ", " + e.latlng.lat);
		});
	}
    document.dispatchEvent( new Event( 'maploaded' ) );
});
