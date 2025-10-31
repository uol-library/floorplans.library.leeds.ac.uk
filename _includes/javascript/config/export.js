export const floorplans = {
	conf: {
        debug: true,
		maxZoom: 25,
		minZoom: 0,
		startZoom: 19,
		startLat: 53.80790461539562,
		startLng: -1.5534367612770303
	},
	mapBounds: null,
	map: null,
	osm: null,
	esri_sat: null,
	imgconf: {
		maxZoom: 5,
		minZoom: 1,
		startZoom: 1,
		startLat: 0,
		startLng: 0,
		paddingTopLeft: [300,0],
		paddingBottomRight: [0,0]
	},
	maxHeight: 0,
	maxWidth: 0,
	controls: null,
	infoPanel: null,
	currentFloor: false,
	occupancyData: {
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
	}
};