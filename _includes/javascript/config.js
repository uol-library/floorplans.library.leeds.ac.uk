const floorplans = {
	conf: {
        debug: {% if site.environment == "development" %}true{% else %}false{% endif %},
		maxZoom: 25,
		minZoom: 0,
		startZoom: 19,
		startLat: 53.80790461539562,
		startLng: -1.5534367612770303,
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
		paddingBottomRight: [0,0],
		baseURL: '{{ site.url }}{{site.baseurl}}'
	},
	maxHeight: 0,
	maxWidth: 0,
	controls: null,
	infoPanel: null,
	currentFloor: false,
	palette: [
		'#ff3b8d',
		'#009e8c',
		'#ff426c',
		'#00999a',
		'#ff4647',
		'#0098a9',
		'#fd4d00',
		'#0094b4',
		'#d57300',
		'#0092c5',
		'#b98300',
		'#008fdb',
		'#9c8b00',
		'#0089fc',
		'#819300',
		'#657eff',
		'#5c9b00',
		'#9b70ff',
		'#00a21f',
		'#d150ff',
		'#00a05a',
		'#f911e0',
		'#009f78',
		'#ff2fb2'
	]
};
floorplans.imagelayers = [
	{
		"id": "brotherton",
		"title": "The Brotherton Library",
		"floors": [
			{
				"floorid": "brotherton-m1",
				"floorname": "Brotherton Library Main building, level 1",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/brotherton-m1.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/brotherton-m1.json",
				"width": 5077,
				"height": 5988
			},
			{
				"floorid": "brotherton-m2",
				"floorname": "Brotherton Library Main building, level 2",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/brotherton-m2.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/brotherton-m2.json",
				"width": 5075,
				"height": 5835
			},
			{
				"floorid": "brotherton-m3",
				"floorname": "Brotherton Library Main building, level 3",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/brotherton-m3.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/brotherton-m3.json",
				"width": 5077,
				"height": 5784
			},
			{
				"floorid": "brotherton-m4",
				"floorname": "Brotherton Library Main building, level 4",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/brotherton-m4.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/brotherton-m4.json",
				"width": 5061,
				"height": 6120
			},
			{
				"floorid": "brotherton-w2",
				"floorname": "Brotherton Library West building, level 2",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/brotherton-w2.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/brotherton-w2.json",
				"width": 5064,
				"height": 6933
			},
			{
				"floorid": "brotherton-w3",
				"floorname": "Brotherton Library West building, level 3",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/brotherton-w3.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/brotherton-w3.json",
				"width": 5049,
				"height": 6734
			}
		]
	},
	{
		"id": "edwardboyle",
		"title": "Edward Boyle Library",
		"floors": [
			{
				"floorid": "edwardboyle-8",
				"floorname": "Edward Boyle Library, level 8",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/edwardboyle-8.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/edwardboyle-8.json",
				"width": 5000,
				"height": 2577
			},
			{
				"floorid": "edwardboyle-9",
				"floorname": "Edward Boyle Library, level 9",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/edwardboyle-9.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/edwardboyle-9.json",
				"width": 5000,
				"height": 2689
			},
			{
				"floorid": "edwardboyle-10",
				"floorname": "Edward Boyle Library, level 10",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/edwardboyle-10.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/edwardboyle-10.json",
				"width": 5000,
				"height": 2327
			},
			{
				"floorid": "edwardboyle-11",
				"floorname": "Edward Boyle Library, level 11",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/edwardboyle-11.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/edwardboyle-11.json",
				"width": 5000,
				"height": 2847
			},
			{
				"floorid": "edwardboyle-12",
				"floorname": "Edward Boyle Library, level 12",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/edwardboyle-12.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/edwardboyle-12.json",
				"width": 5000,
				"height": 2932
			},
			{
				"floorid": "edwardboyle-13",
				"floorname": "Edward Boyle Library, level 13",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/edwardboyle-13.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/edwardboyle-13.json",
				"width": 5000,
				"height": 2813
			}
		]
	},
	{
		"id": "healthsciences",
		"title": "Health Sciences Library",
		"floors": [
			{
				"floorid": "health-sciences",
				"floorname": "Health Sciences Library",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/health-sciences.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/health-sciences.json",
				"width": 3840,
				"height": 5952
			}
		]
	},
	{
		"id": "laidlaw",
		"title": "Laidlaw Library",
		"floors": [
			{
				"floorid": "laidlaw-ground",
				"floorname": "Laidlaw Library, ground floor",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/laidlaw-ground.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/laidlaw-ground.json",
				"width": 5000,
				"height": 2614
			},
			{
				"floorid": "laidlaw-first",
				"floorname": "Laidlaw Library, first floor",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/laidlaw-first.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/laidlaw-first.json",
				"width": 5000,
				"height": 2585
			},
			{
				"floorid": "laidlaw-second",
				"floorname": "Laidlaw Library, second floor",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/laidlaw-second.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/laidlaw-second.json",
				"width": 5000,
				"height": 2589
			},
			{
				"floorid": "laidlaw-third",
				"floorname": "Laidlaw Library, third floor",
				"imageurl": floorplans.imgconf.baseURL + "/assets/images/laidlaw-third.png",
				"dataurl": floorplans.imgconf.baseURL + "/assets/features/laidlaw-third.json",
				"width": 5000,
				"height": 3460
			}
		]
	}
];