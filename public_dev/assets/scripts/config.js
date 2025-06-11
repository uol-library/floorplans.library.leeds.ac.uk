const floorplans = {
	conf: {
        debug: false,
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
		baseURL: 'https://dev-floorplans.library.leeds.ac.uk'
	},
	maxHeight: 0,
	maxWidth: 0,
	controls: null,
	infoPanel: null,
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
function getFeatures() {
    return [["Slavonic","laidlaw-third-16"],["Semitic","laidlaw-third-15"],["Portuguese","laidlaw-third-14"],["Politics","laidlaw-third-13"],["Physics","laidlaw-third-12"],["Philosophy","laidlaw-third-11"],["Reshelving Area","laidlaw-third-10"],["Social Policy","laidlaw-third-9"],["Sociology","laidlaw-third-8"],["Spanish","laidlaw-third-7"],["Sports Science","laidlaw-third-6"],["Textiles","laidlaw-third-5"],["Theatre","laidlaw-third-4"],["Theology","laidlaw-third-3"],["Zoology","laidlaw-third-2"],["Transport","laidlaw-third-1"],["Linguistics","laidlaw-second-19"],["Law","laidlaw-second-18"],["Latin","laidlaw-second-17"],["Japanese","laidlaw-second-16"],["Italian","laidlaw-second-15"],["Icelandic","laidlaw-second-14"],["History of Science","laidlaw-second-13"],["Greek","laidlaw-second-12"],["German","laidlaw-second-11"],["Geology","laidlaw-second-10"],["Geography","laidlaw-second-9"],["Reshelving Area","laidlaw-second-8"],["Management","laidlaw-second-7"],["Materials","laidlaw-second-6"],["Mathematics","laidlaw-second-5"],["Mechanical Engineering","laidlaw-second-4"],["Mining","laidlaw-second-3"],["Modern History","laidlaw-second-2"],["Music","laidlaw-second-1"],["Skills","laidlaw-first-32"],["General Literature","laidlaw-first-31"],["General Science","laidlaw-first-30"],["General Classics","laidlaw-first-29"],["General Languages","laidlaw-first-28"],["General Biology","laidlaw-first-27"],["Fuel","laidlaw-first-26"],["French","laidlaw-first-25"],["Food","laidlaw-first-24"],["English","laidlaw-first-23"],["Engineering","laidlaw-first-22"],["Electrical Engineering","laidlaw-first-21"],["Reshelving Area (Group Study Area)","laidlaw-first-20"],["Ancient History","laidlaw-first-19"],["Anthropology","laidlaw-first-18"],["Applied Biology","laidlaw-first-17"],["Archaeology","laidlaw-first-16"],["Architecture","laidlaw-first-15"],["Art","laidlaw-first-14"],["Astronomy","laidlaw-first-13"],["Bibliography","laidlaw-first-12"],["Botany","laidlaw-first-11"],["Chemical Engineering","laidlaw-first-10"],["Chemistry","laidlaw-first-9"],["Chinese","laidlaw-first-8"],["Civil Engineering","laidlaw-first-7"],["Colour Chemistry","laidlaw-first-6"],["Communication Studies","laidlaw-first-5"],["Computer Studies","laidlaw-first-4"],["Economics","laidlaw-first-3"],["Education","laidlaw-first-2"],["Reshelving Area (Silent Study Area)","laidlaw-first-1"],["Pamphlets","health-sciences-57"],["AVC","health-sciences-56"],["Requested Items","health-sciences-55"],["Z","health-sciences-54"],["W","health-sciences-53"],["WZ","health-sciences-52"],["WY","health-sciences-51"],["WX","health-sciences-50"],["WW","health-sciences-49"],["WV","health-sciences-48"],["WU","health-sciences-47"],["WT","health-sciences-46"],["WS","health-sciences-45"],["WR","health-sciences-44"],["Q","health-sciences-43"],["WP","health-sciences-42"],["WO","health-sciences-41"],["WN","health-sciences-40"],["WM","health-sciences-39"],["WL","health-sciences-38"],["WK","health-sciences-37"],["WJ","health-sciences-36"],["WI","health-sciences-35"],["WH","health-sciences-34"],["WG","health-sciences-33"],["WF","health-sciences-32"],["WE","health-sciences-31"],["WD","health-sciences-30"],["WC","health-sciences-29"],["WB","health-sciences-28"],["WA","health-sciences-27"],["WQ","health-sciences-26"],["QZ","health-sciences-25"],["QY","health-sciences-24"],["QW","health-sciences-23"],["QV","health-sciences-22"],["QU","health-sciences-21"],["QT","health-sciences-20"],["QS","health-sciences-19"],["QP","health-sciences-18"],["QL","health-sciences-17"],["QH","health-sciences-16"],["QD","health-sciences-15"],["QC","health-sciences-14"],["QB","health-sciences-13"],["QA","health-sciences-12"],["HV","health-sciences-11"],["HM","health-sciences-10"],["GN","health-sciences-9"],["BM","health-sciences-8"],["BL","health-sciences-7"],["BF","health-sciences-6"],["Statistics","health-sciences-5"],["Reference","health-sciences-4"],["Psychology","health-sciences-3"],["Periodicals","health-sciences-2"],["Abstracts","health-sciences-1"],["Reshelving Area","edwardboyle-8-7"],["Reshelving Area","edwardboyle-8-6"],["Journal","edwardboyle-8-5"],["Stack Large","edwardboyle-8-4"],["Maps","edwardboyle-8-26"],["Stack","edwardboyle-8-3"],["Official Publications","edwardboyle-8-2"],["Reshelving Area","edwardboyle-8-1"],["Universities","edwardboyle-12-13"],["Sociology","edwardboyle-12-12"],["Social Policy","edwardboyle-12-11"],["Politics","edwardboyle-12-10"],["Management","edwardboyle-12-9"],["Law Reference","edwardboyle-12-8"],["Law","edwardboyle-12-7"],["Education","edwardboyle-12-6"],["Economics","edwardboyle-12-5"],["Business Reference","edwardboyle-12-4"],["Recently Returned","edwardboyle-12-3"],["Recently Returned","edwardboyle-12-2"],["Large","edwardboyle-12-1"],["Engineering","edwardboyle-11-30"],["Zoology","edwardboyle-11-29"],["Transport","edwardboyle-11-28"],["Sports Science","edwardboyle-11-27"],["Civil Engineering","edwardboyle-11-26"],["Chemistry","edwardboyle-11-25"],["Chemical Engineering","edwardboyle-11-24"],["Botany","edwardboyle-11-23"],["Astronomy","edwardboyle-11-22"],["Applied Biology","edwardboyle-11-21"],["Atlas Case","edwardboyle-11-20"],["Recently Returned","edwardboyle-11-19"],["Recently Returned","edwardboyle-11-18"],["Physics","edwardboyle-11-17"],["Mining","edwardboyle-11-16"],["Mechanical Engineering","edwardboyle-11-15"],["Mathematics","edwardboyle-11-14"],["Materials","edwardboyle-11-13"],["History of Science","edwardboyle-11-12"],["Geology","edwardboyle-11-11"],["Geography","edwardboyle-11-10"],["General Science","edwardboyle-11-9"],["General Biology","edwardboyle-11-8"],["Fuel","edwardboyle-11-7"],["Food","edwardboyle-11-6"],["Zoology","edwardboyle-11-5"],["Electrical Engineering","edwardboyle-11-4"],["Computer Studies","edwardboyle-11-3"],["Colour Chemistry","edwardboyle-11-2"],["Large","edwardboyle-11-1"],["Recently Returned","brotherton-w2-81"],["Communications Studies","brotherton-w2-80"],["Music","brotherton-w2-79"],["Textiles","brotherton-w2-78"],["Theatre","brotherton-w2-77"],["Art","brotherton-w2-76"],["All Large Journals & Foreign Newspapers","brotherton-w2-75"],["Yorkshire Journals","brotherton-w2-74"],["YAHS Journals","brotherton-w2-73"],["Theology Journals","brotherton-w2-72"],["Theatre Journals","brotherton-w2-71"],["Textiles Journals","brotherton-w2-70"],["Spanish Journals","brotherton-w2-69"],["Slavonic Journals","brotherton-w2-68"],["Semitic Journals","brotherton-w2-67"],["Scandinavian Journals","brotherton-w2-66"],["Portugese Journals","brotherton-w2-65"],["Philosophy Journals","brotherton-w2-64"],["Numismatics Journals","brotherton-w2-63"],["Music Journals","brotherton-w2-62"],["Mongolian Journals","brotherton-w2-61"],["Modern History Journals","brotherton-w2-60"],["Linguistics Journals","brotherton-w2-59"],["Lattimore Journals","brotherton-w2-58"],["Korean Journals","brotherton-w2-57"],["Japanese Journals","brotherton-w2-56"],["Italian Journals","brotherton-w2-55"],["Holden Journals","brotherton-w2-54"],["German Journals","brotherton-w2-53"],["General Literature Journals","brotherton-w2-52"],["General Languages Journals","brotherton-w2-51"],["General Journals","brotherton-w2-50"],["Ancient History Journals","brotherton-w2-49"],["Anthropology Journals","brotherton-w2-48"],["Architecture Journals","brotherton-w2-47"],["Art Journals","brotherton-w2-46"],["Bibliography Journals","brotherton-w2-45"],["Canada Journals","brotherton-w2-44"],["Celtic Journals","brotherton-w2-43"],["Chinese Journals","brotherton-w2-42"],["Communications Studies Journals","brotherton-w2-41"],["English Journals","brotherton-w2-40"],["French Journals","brotherton-w2-39"],["General Classics Journals","brotherton-w2-38"],["All Stack Large A-Z","brotherton-w2-37"],["Stack Yearbooks","brotherton-w2-36"],["Stack Theology","brotherton-w2-35"],["Stack Textiles","brotherton-w2-34"],["Stack Swedish","brotherton-w2-33"],["Stack Slavonic","brotherton-w2-32"],["Stack Scandinavian","brotherton-w2-31"],["Stack Philosophy","brotherton-w2-30"],["Stack Numismatics","brotherton-w2-29"],["Stack Norwegian","brotherton-w2-28"],["Stack Music","brotherton-w2-27"],["Stack Mongolian","brotherton-w2-26"],["Stack Modern History","brotherton-w2-25"],["Stack Lattimore","brotherton-w2-24"],["Stack Latin","brotherton-w2-23"],["Stack Korean","brotherton-w2-22"],["Stack Icelandic","brotherton-w2-21"],["Stack Hong Kong","brotherton-w2-20"],["Stack Holden","brotherton-w2-19"],["Stack Greek","brotherton-w2-18"],["Stack General Literature","brotherton-w2-17"],["Stack General Classics","brotherton-w2-16"],["Stack Fulford","brotherton-w2-15"],["Stack French","brotherton-w2-14"],["Stack English","brotherton-w2-13"],["Stack Dobree","brotherton-w2-12"],["Stack Danish","brotherton-w2-11"],["Stack Communications Studies","brotherton-w2-10"],["Stack Chinese","brotherton-w2-9"],["Stack Celtic","brotherton-w2-8"],["Stack Cartularies","brotherton-w2-7"],["Stack Art","brotherton-w2-6"],["Stack Architecture","brotherton-w2-5"],["Stack Archaeology","brotherton-w2-4"],["Stack Anthropology","brotherton-w2-3"],["Stack Ancient History","brotherton-w2-2"],["Stack Abstracts","brotherton-w2-1"],["English","brotherton-m4-5"],["Recently returned","brotherton-m4-4"],["Bibliography","brotherton-m4-3"],["General Literature","brotherton-m4-2"],["Large","brotherton-m4-1"],["Journals","brotherton-m3-13"],["Recently Returned","brotherton-m3-12"],["Ancient History","brotherton-m3-11"],["General Classics","brotherton-m3-10"],["Greek","brotherton-m3-9"],["Latin","brotherton-m3-8"],["Atlases","brotherton-m3-7"],["General Reference","brotherton-m3-6"],["Large Ancient History","brotherton-m3-5"],["Large General Classics","brotherton-m3-4"],["Large Greek","brotherton-m3-3"],["Large Latin","brotherton-m3-2"],["Pamphlets","brotherton-m3-1"],["Recently Returned","brotherton-m2-9"],["French","brotherton-m2-8"],["Yorkshire","brotherton-m2-7"],["Portuguese","brotherton-m2-6"],["Modern History P-Z","brotherton-m2-5"],["Modern History A-P","brotherton-m2-4"],["Large Modern History","brotherton-m2-3"],["Spanish","brotherton-m2-2"],["Philosophy","brotherton-m2-1"],["CD, DVD (All Subjects)","brotherton-m1-14"],["Recently Returned","brotherton-m1-12"],["German","brotherton-m1-11"],["Microfilm","brotherton-m1-10"],["Italian","brotherton-m1-9"],["General Languages","brotherton-m1-8"],["Linguistics","brotherton-m1-7"],["Semitic","brotherton-m1-6"],["Slavonic","brotherton-m1-5"],["Japanese","brotherton-m1-4"],["Chinese","brotherton-m1-3"],["Theology","brotherton-m1-2"],["YAHS","brotherton-m1-1"]];
};
