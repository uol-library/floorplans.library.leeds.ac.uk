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
		baseURL: 'https://floorplans.library.leeds.ac.uk'
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
function getFeatures() {
    return [["Slavonic","laidlaw-third-18"],["Semitic","laidlaw-third-17"],["Portuguese","laidlaw-third-16"],["Politics","laidlaw-third-15"],["Physics","laidlaw-third-14"],["Philosophy","laidlaw-third-13"],["Reshelving Area","laidlaw-third-12"],["Social Policy","laidlaw-third-11"],["Sociology","laidlaw-third-10"],["Spanish","laidlaw-third-9"],["Sports Science","laidlaw-third-8"],["Textiles","laidlaw-third-7"],["Theatre","laidlaw-third-6"],["Theology","laidlaw-third-5"],["Zoology","laidlaw-third-4"],["Transport","laidlaw-third-3"],["Linguistics","laidlaw-second-22"],["Law","laidlaw-second-21"],["Latin","laidlaw-second-20"],["Japanese","laidlaw-second-19"],["Italian","laidlaw-second-18"],["Icelandic","laidlaw-second-17"],["History of Science","laidlaw-second-16"],["Greek","laidlaw-second-15"],["German","laidlaw-second-14"],["Geology","laidlaw-second-13"],["Geography","laidlaw-second-12"],["Reshelving Area","laidlaw-second-11"],["Management","laidlaw-second-10"],["Materials","laidlaw-second-9"],["Mathematics","laidlaw-second-8"],["Mechanical Engineering","laidlaw-second-7"],["Mining","laidlaw-second-6"],["Modern History","laidlaw-second-5"],["Music","laidlaw-second-4"],["Skills","laidlaw-first-35"],["General Literature","laidlaw-first-34"],["General Science","laidlaw-first-33"],["General Classics","laidlaw-first-32"],["General Languages","laidlaw-first-31"],["General Biology","laidlaw-first-30"],["Fuel","laidlaw-first-29"],["French","laidlaw-first-28"],["Food","laidlaw-first-27"],["English","laidlaw-first-26"],["Engineering","laidlaw-first-25"],["Electrical Engineering","laidlaw-first-24"],["Reshelving Area (Group Study Area)","laidlaw-first-23"],["Ancient History","laidlaw-first-22"],["Anthropology","laidlaw-first-21"],["Applied Biology","laidlaw-first-20"],["Archaeology","laidlaw-first-19"],["Architecture","laidlaw-first-18"],["Art","laidlaw-first-17"],["Astronomy","laidlaw-first-16"],["Bibliography","laidlaw-first-15"],["Botany","laidlaw-first-14"],["Chemical Engineering","laidlaw-first-13"],["Chemistry","laidlaw-first-12"],["Chinese","laidlaw-first-11"],["Civil Engineering","laidlaw-first-10"],["Colour Chemistry","laidlaw-first-9"],["Communication Studies","laidlaw-first-8"],["Computer Studies","laidlaw-first-7"],["Economics","laidlaw-first-6"],["Education","laidlaw-first-5"],["Reshelving Area (Silent space)","laidlaw-first-4"],["Pamphlets","health-sciences-61"],["AVC - Audio-Visual Collection","health-sciences-60"],["Requested Items","health-sciences-59"],["Z - Information Skills","health-sciences-58"],["W - General Medicine, Health Professions","health-sciences-57"],["WZ - History of Medicine","health-sciences-56"],["WY - Nursing","health-sciences-55"],["WX - Hospitals and Other Health Facilities","health-sciences-54"],["WW - Ophthalmology","health-sciences-53"],["WV - Otolaryngology","health-sciences-52"],["WU - Dentistry, Oral Surgery","health-sciences-51"],["WT - Geriatrics, Chronic Disease","health-sciences-50"],["WS - Pediatrics","health-sciences-49"],["WR - Dermatology","health-sciences-48"],["Q - General Sciences","health-sciences-47"],["WP - Gynecology","health-sciences-46"],["WO - Surgery","health-sciences-45"],["WN - Radiology. Diagnostic Imaging","health-sciences-44"],["WM - Psychiatry","health-sciences-43"],["WL - Nervous System","health-sciences-42"],["WK - Endocrine System","health-sciences-41"],["WJ - Urogenital System","health-sciences-40"],["WI - Digestive System","health-sciences-39"],["WH - Haemic and Lymphatic Systems","health-sciences-38"],["WG - Cardiovascular System","health-sciences-37"],["WF - Respiratory System","health-sciences-36"],["WE - Musculoskeletal System","health-sciences-35"],["WD - Disorders of Systemic, Metabolic or Environmental Origin","health-sciences-34"],["WC - Communicable Diseases","health-sciences-33"],["WB - Practice of Medicine","health-sciences-32"],["WA - Patients and Primary Care","health-sciences-31"],["WQ - Obstetrics","health-sciences-30"],["QZ - Pathology and Oncology","health-sciences-29"],["QY - Clinical Pathology","health-sciences-28"],["QW - Microbiology and Immunology","health-sciences-27"],["QV -Pharmacology","health-sciences-26"],["QU - Biochemistry, Cell Biology and Genetics","health-sciences-25"],["QT - Human Physiology","health-sciences-24"],["QS - Human Anatomy","health-sciences-23"],["QP - Physiology","health-sciences-22"],["QL - Zoology","health-sciences-21"],["QH - Biology","health-sciences-20"],["QD - Chemistry","health-sciences-19"],["QC - Physics","health-sciences-18"],["QB - Astronomy","health-sciences-17"],["QA - Mathematics","health-sciences-16"],["HV - Social Services","health-sciences-15"],["HM - Sociology","health-sciences-14"],["GN - Anthropology","health-sciences-13"],["BM - Judaism","health-sciences-12"],["BL - Religions","health-sciences-11"],["BF - Psychology","health-sciences-10"],["Statistics","health-sciences-9"],["Reference","health-sciences-8"],["Psychology","health-sciences-7"],["Periodicals","health-sciences-6"],["Abstracts","health-sciences-5"],["Reshelving Area","edwardboyle-8-9"],["Journal","edwardboyle-8-8"],["Stack Large","edwardboyle-8-7"],["Maps","edwardboyle-8-6"],["Stack","edwardboyle-8-5"],["Official Publications","edwardboyle-8-4"],["Universities","edwardboyle-12-13"],["Sociology","edwardboyle-12-12"],["Social Policy","edwardboyle-12-11"],["Politics","edwardboyle-12-10"],["Management","edwardboyle-12-9"],["Law Reference","edwardboyle-12-8"],["Law","edwardboyle-12-7"],["Education","edwardboyle-12-6"],["Economics","edwardboyle-12-5"],["Business Reference","edwardboyle-12-4"],["Recently Returned","edwardboyle-12-3"],["Large","edwardboyle-12-2"],["Engineering","edwardboyle-11-30"],["Transport","edwardboyle-11-28"],["Sports Science","edwardboyle-11-27"],["Civil Engineering","edwardboyle-11-26"],["Chemistry","edwardboyle-11-25"],["Chemical Engineering","edwardboyle-11-24"],["Botany","edwardboyle-11-23"],["Astronomy","edwardboyle-11-22"],["Applied Biology","edwardboyle-11-21"],["Atlas Case","edwardboyle-11-20"],["Recently Returned","edwardboyle-11-19"],["Physics","edwardboyle-11-18"],["Mining","edwardboyle-11-17"],["Mechanical Engineering","edwardboyle-11-16"],["Mathematics","edwardboyle-11-15"],["Materials","edwardboyle-11-14"],["History of Science","edwardboyle-11-13"],["Geology","edwardboyle-11-12"],["Geography","edwardboyle-11-11"],["General Science","edwardboyle-11-10"],["General Biology","edwardboyle-11-9"],["Fuel","edwardboyle-11-8"],["Food","edwardboyle-11-7"],["Zoology","edwardboyle-11-6"],["Electrical Engineering","edwardboyle-11-5"],["Computer Studies","edwardboyle-11-4"],["Colour Chemistry","edwardboyle-11-3"],["Large","edwardboyle-11-2"],["Recently Returned","brotherton-w2-82"],["Communications Studies","brotherton-w2-81"],["Music","brotherton-w2-80"],["Textiles","brotherton-w2-79"],["Theatre","brotherton-w2-78"],["Art","brotherton-w2-77"],["All Large Journals & Foreign Newspapers","brotherton-w2-76"],["Yorkshire Journals","brotherton-w2-75"],["YAHS Journals","brotherton-w2-74"],["Theology Journals","brotherton-w2-73"],["Theatre Journals","brotherton-w2-72"],["Textiles Journals","brotherton-w2-71"],["Spanish Journals","brotherton-w2-70"],["Slavonic Journals","brotherton-w2-69"],["Semitic Journals","brotherton-w2-68"],["Scandinavian Journals","brotherton-w2-67"],["Portugese Journals","brotherton-w2-66"],["Philosophy Journals","brotherton-w2-65"],["Numismatics Journals","brotherton-w2-64"],["Music Journals","brotherton-w2-63"],["Mongolian Journals","brotherton-w2-62"],["Modern History Journals","brotherton-w2-61"],["Linguistics Journals","brotherton-w2-60"],["Lattimore Journals","brotherton-w2-59"],["Korean Journals","brotherton-w2-58"],["Japanese Journals","brotherton-w2-57"],["Italian Journals","brotherton-w2-56"],["Holden Journals","brotherton-w2-55"],["German Journals","brotherton-w2-54"],["General Literature Journals","brotherton-w2-53"],["General Languages Journals","brotherton-w2-52"],["General Journals","brotherton-w2-51"],["Ancient History Journals","brotherton-w2-50"],["Anthropology Journals","brotherton-w2-49"],["Architecture Journals","brotherton-w2-48"],["Art Journals","brotherton-w2-47"],["Bibliography Journals","brotherton-w2-46"],["Canada Journals","brotherton-w2-45"],["Celtic Journals","brotherton-w2-44"],["Chinese Journals","brotherton-w2-43"],["Communications Studies Journals","brotherton-w2-42"],["English Journals","brotherton-w2-41"],["French Journals","brotherton-w2-40"],["General Classics Journals","brotherton-w2-39"],["All Stack Large A-Z","brotherton-w2-38"],["Stack Yearbooks","brotherton-w2-37"],["Stack Theology","brotherton-w2-36"],["Stack Textiles","brotherton-w2-35"],["Stack Swedish","brotherton-w2-34"],["Stack Slavonic","brotherton-w2-33"],["Stack Scandinavian","brotherton-w2-32"],["Stack Philosophy","brotherton-w2-31"],["Stack Numismatics","brotherton-w2-30"],["Stack Norwegian","brotherton-w2-29"],["Stack Music","brotherton-w2-28"],["Stack Mongolian","brotherton-w2-27"],["Stack Modern History","brotherton-w2-26"],["Stack Lattimore","brotherton-w2-25"],["Stack Latin","brotherton-w2-24"],["Stack Korean","brotherton-w2-23"],["Stack Icelandic","brotherton-w2-22"],["Stack Hong Kong","brotherton-w2-21"],["Stack Holden","brotherton-w2-20"],["Stack Greek","brotherton-w2-19"],["Stack General Literature","brotherton-w2-18"],["Stack General Classics","brotherton-w2-17"],["Stack Fulford","brotherton-w2-16"],["Stack French","brotherton-w2-15"],["Stack English","brotherton-w2-14"],["Stack Dobree","brotherton-w2-13"],["Stack Danish","brotherton-w2-12"],["Stack Communications Studies","brotherton-w2-11"],["Stack Chinese","brotherton-w2-10"],["Stack Celtic","brotherton-w2-9"],["Stack Cartularies","brotherton-w2-8"],["Stack Art","brotherton-w2-7"],["Stack Architecture","brotherton-w2-6"],["Stack Archaeology","brotherton-w2-5"],["Stack Anthropology","brotherton-w2-4"],["Stack Ancient History","brotherton-w2-3"],["Stack Abstracts","brotherton-w2-2"],["English","brotherton-m4-6"],["Recently returned","brotherton-m4-5"],["Bibliography","brotherton-m4-4"],["General Literature","brotherton-m4-3"],["Large","brotherton-m4-2"],["Journals","brotherton-m3-15"],["Recently Returned","brotherton-m3-14"],["Ancient History","brotherton-m3-13"],["General Classics","brotherton-m3-12"],["Greek","brotherton-m3-11"],["Latin","brotherton-m3-10"],["Atlases","brotherton-m3-9"],["General Reference","brotherton-m3-8"],["Large Ancient History","brotherton-m3-7"],["Large General Classics","brotherton-m3-6"],["Large Greek","brotherton-m3-5"],["Large Latin","brotherton-m3-4"],["Pamphlets","brotherton-m3-3"],["Recently Returned","brotherton-m2-11"],["French","brotherton-m2-10"],["Yorkshire","brotherton-m2-9"],["Portuguese","brotherton-m2-8"],["Modern History P–Z","brotherton-m2-7"],["Modern History A–O","brotherton-m2-6"],["Large Modern History","brotherton-m2-5"],["Spanish","brotherton-m2-4"],["Philosophy","brotherton-m2-3"],["CD, DVD (All Subjects)","brotherton-m1-15"],["Recently Returned","brotherton-m1-13"],["German","brotherton-m1-12"],["Microfilm","brotherton-m1-11"],["Italian","brotherton-m1-10"],["General Languages","brotherton-m1-9"],["Linguistics","brotherton-m1-8"],["Semitic","brotherton-m1-7"],["Slavonic","brotherton-m1-6"],["Japanese","brotherton-m1-5"],["Chinese","brotherton-m1-4"],["Theology","brotherton-m1-3"],["YAHS","brotherton-m1-2"],["CD, DVD (All Subjects)","brotherton-m1-icons-15"],["Recently Returned","brotherton-m1-icons-13"],["German","brotherton-m1-icons-12"],["Microfilm","brotherton-m1-icons-11"],["Italian","brotherton-m1-icons-10"],["General Languages","brotherton-m1-icons-9"],["Linguistics","brotherton-m1-icons-8"],["Semitic","brotherton-m1-icons-7"],["Slavonic","brotherton-m1-icons-6"],["Japanese","brotherton-m1-icons-5"],["Chinese","brotherton-m1-icons-4"],["Theology","brotherton-m1-icons-3"],["YAHS","brotherton-m1-icons-2"]];
};
floorplans.icons = {
    "arrows": {
        "viewBox": "-11 0 1022 1000",
        "path": "<path fill=\"currentColor\" d=\"M1000 661v107q0 7 -5 12t-13 6h-768v107q0 7 -5 12t-13 6q-6 0 -13 -6l-178 -178q-5 -6 -5 -13q0 -8 5 -13l179 -178q5 -5 12 -5q8 0 13 5t5 13v107h768q7 0 13 5t5 13zM1000 357q0 8 -5 13l-179 178q-5 6 -12 6q-8 0 -13 -6t-5 -12v-107h-768q-7 0 -13 -6t-5 -12v-107 q0 -8 5 -13t13 -5h768v-107q0 -8 5 -13t13 -5q6 0 13 5l178 178q5 5 5 13z\"/>"
    },
    "book-return": {
        "viewBox": "-11 0 879 1000",
        "path": "<path fill=\"currentColor\" d=\"M400 778l254 -253q10 -11 10 -25t-10 -25l-254 -254q-10 -10 -25 -10t-25 10l-57 57q-11 11 -11 26t11 25l171 171l-171 171q-11 11 -11 25t11 25l57 57q11 11 25 11t25 -11zM857 500q0 117 -57 215t-156 156t-215 58t-216 -58t-155 -156t-58 -215t58 -215t155 -156 t216 -58t215 58t156 156t57 215z\"/>"
    },
    "book": {
        "viewBox": "-10 0 938 1000",
        "path": "<path fill=\"currentColor\" d=\"M464 221q5 -5 15 -12t47 -26t83 -35t127 -27t175 -12v670q-95 0 -176 12t-128 27t-82 34t-47 29l-14 10q-4 -4 -13 -12t-46 -26t-83 -35t-127 -27t-177 -12v-670q94 0 174 12t128 27t83 33t48 29zM130 221v450q172 14 279 71v-449q-110 -58 -279 -72zM799 671v-450 q-168 14 -278 72v449q108 -57 278 -71z\"/>"
    },
    "cafe": {
        "viewBox": "-10 0 970 1000",
        "path": "<path fill=\"currentColor\" d=\"M150 150q-21 0 -35.5 14.5t-14.5 35.5v450q0 21 14.5 35.5t35.5 14.5h550q21 0 35.5 -14.5t14.5 -35.5v-50h25q11 0 17.5 -6t7 -12.5l0.5 -6.5v-25h50q38 0 69 -31t31 -69v-150q0 -19 -15.5 -34.5t-34.5 -15.5h-150v-50q0 -21 -14.5 -35.5t-35.5 -14.5h-550zM750 300h125 q11 0 17.5 6t7 12.5l0.5 6.5v125q0 19 -15.5 34.5t-34.5 15.5h-100v-200zM0 750l75 75q25 25 50 25h600q25 0 50 -25l75 -75h-850z\"/>"
    },
    "coins": {
        "viewBox": "-10 0 1010 1000",
        "path": "<path fill=\"currentColor\" d=\"M270 168q94 -43 230 -43t230 43q42 19 62.5 41t20.5 41t-20.5 41t-62.5 41q-94 43 -230 43t-230 -43q-82 -37 -82 -82t82 -82zM813 356v81q0 44 -83 83q-92 42 -230 42t-230 -42q-82 -38 -82 -83v-81q22 17 56 33q107 48 256 48t256 -48q30 -13 57 -33zM875 250 q0 -85 -119 -139q-109 -49 -256 -49t-256 49q-119 54 -119 139v562q0 85 119 139q106 49 256 49t256 -49q119 -54 119 -139v-562zM813 544v81q0 19 -20.5 41t-62.5 41q-94 43 -230 43t-230 -43q-82 -37 -82 -82v-81q23 17 56 32q106 49 256 49t256 -49q30 -13 57 -32z M813 731v81q0 44 -83 83q-94 43 -230 43t-230 -43q-82 -38 -82 -83v-81q22 17 56 33q107 48 256 48t256 -48q34 -15 57 -33z\"/>"
    },
    "cube": {
        "viewBox": "-10 0 1010 1000",
        "path": "<path fill=\"currentColor\" d=\"M500 909l357 -195v-355l-357 130v420zM464 426l390 -141l-390 -142l-389 142zM929 286v428q0 20 -10 37t-28 26l-393 214q-15 9 -34 9t-34 -9l-393 -214q-17 -10 -27 -26t-10 -37v-428q0 -23 13 -41t34 -26l393 -143q12 -5 24 -5t25 5l393 143q21 8 34 26t13 41z\"/>"
    },
    "cubes": {
        "viewBox": "-10 0 1295 1000",
        "path": "<path fill=\"currentColor\" d=\"M357 911l214 -107v-176l-214 92v191zM321 657l226 -96l-226 -97l-225 97zM929 911l214 -107v-176l-214 92v191zM893 657l225 -96l-225 -97l-226 97zM643 494l214 -92v-149l-214 92v149zM607 282l246 -105l-246 -106l-246 106zM1214 571v233q0 20 -10 37t-29 26l-250 125 q-14 8 -32 8t-32 -8l-250 -125l-4 -2q-1 1 -4 2l-250 125q-14 8 -32 8t-31 -8l-250 -125q-19 -9 -29 -26t-11 -37v-233q0 -21 12 -39t32 -26l242 -104v-223q0 -22 12 -40t31 -26l250 -107q13 -6 28 -6t28 6l250 107q20 9 32 26t12 40v223l242 104q20 8 32 26t11 39z\"/>"
    },
    "elevator": {
        "viewBox": "-10 0 948 1000",
        "path": "<path fill=\"currentColor\" d=\"M873 1000h-817q-23 0 -39.5 -16.5t-16.5 -39.5v-888q0 -23 16.5 -39.5t39.5 -16.5h817q23 0 39 16.5t16 39.5v888q0 23 -16 39.5t-39 16.5zM343 67h-253q-0.504883 -0.0234375 -1.01465 -0.0234375q-9.10645 0 -15.5537 6.44727q-6.44629 6.44629 -6.44629 15.5527 l0.0146484 0.0234375v822v0.0234375q0 9.10645 6.44629 15.5527q6.44727 6.44727 15.5537 6.44727q0.490234 0 1 -0.0234375h253v-866zM513 67h-102v866h102v-866zM861 89q0 -9 -6.5 -15.5t-15.5 -6.5h-258v866h258q9 0 15.5 -6.5t6.5 -15.5v-822zM747 625q-10 15 -28 15v0 q-12 0 -21 -8h-1q0 -1 -1 -1l-1 -1l-63 -64q-15.6094 -10.0654 -15.6094 -28.5957q0 -14.0732 9.96289 -24.0361q9.96289 -9.96387 24.0371 -9.96387q18.5527 0 28.6094 15.5957l7 6v-129v-0.0146484q0 -13.7979 9.62891 -23.6895q9.62793 -9.8916 23.3711 -10.2959v0 q14 0 24 10t10 24v128l5 -5q9.01855 -6.71973 20.2852 -6.71973q14.0742 0 24.0371 9.96289q9.96289 9.96387 9.96289 24.0371q0 10.9023 -6.28516 19.7197zM177 376q10.1797 -14.4531 27.8154 -14.4531q11.8418 0 21.1846 7.45312q1 0 1 1h1l1 1l63 64 q5.4043 8.38184 5.4043 18.3906q0 14.0732 -9.96289 24.0361q-9.96289 9.96387 -24.0371 9.96387q-10.0449 0 -18.4043 -5.39062l-7 -6v129q-2.09473 12.082 -11.5527 20.1211q-9.45801 8.03809 -21.9463 8.03809t-21.9473 -8.03809q-9.45898 -8.03906 -11.5537 -20.1211 v-128l-5 5q-9.01855 6.71973 -20.2852 6.71973q-14.0742 0 -24.0371 -9.96289q-9.96289 -9.96387 -9.96289 -24.0371q0 -10.9023 6.28516 -19.7197z\"/>"
    },
    "enquiries": {
        "viewBox": "-11 0 879 1000",
        "path": "<path fill=\"currentColor\" d=\"M491 670v89q0 8 -5 13t-13 5h-89q-8 0 -13 -5t-5 -13v-89q0 -8 5 -13t13 -5h89q8 0 13 5t5 13zM634 393q0 28 -8 50t-26 39t-29 24t-33 20q-18 10 -26 16t-14 13t-7 16v18q0 8 -5 13t-13 5h-89q-8 0 -13 -5t-5 -13v-38q0 -19 6 -36t13 -26t22 -20t23 -14t25 -12 q29 -14 42 -24t12 -27q0 -24 -24 -40t-54 -17q-31 0 -53 15q-16 12 -44 47q-5 6 -14 6q-6 0 -11 -3l-60 -46q-6 -4 -7 -11t3 -13q68 -107 195 -107q72 0 133 50t61 120zM429 143q-73 0 -139 28t-114 76t-76 114t-29 139t29 139t76 113t114 77t139 28t138 -28t114 -77 t76 -113t29 -139t-29 -139t-76 -114t-114 -76t-138 -28zM857 500q0 117 -57 215t-156 156t-215 58t-216 -58t-155 -156t-58 -215t58 -215t155 -156t216 -58t215 58t156 156t57 215z\"/>"
    },
    "film": {
        "viewBox": "0 0 1071.4 1094",
        "path": "<path fill=\"currentColor\" d=\"M214 940v-72q0-14-10-25t-25-10h-72q-14 0-25 10t-11 25v72q0 14 11 25t25 11h72q14 0 25-11t10-25zm0-214v-72q0-14-10-25t-25-11h-72q-14 0-25 11t-11 25v72q0 14 11 25t25 10h72q14 0 25-10t10-25zm0-215v-71q0-15-10-25t-25-11h-72q-14 0-25 11t-11 25v71q0 15 11 25t25 11h72q14 0 25-11t10-25zm572 429V654q0-14-11-25t-25-11H321q-14 0-25 11t-10 25v286q0 14 10 25t25 11h429q15 0 25-11t11-25zM214 297v-71q0-15-10-26t-25-10h-72q-14 0-25 10t-11 26v71q0 14 11 25t25 11h72q14 0 25-11t10-25zm786 643v-72q0-14-11-25t-25-10h-71q-15 0-25 10t-11 25v72q0 14 11 25t25 11h71q15 0 25-11t11-25zM786 511V226q0-15-11-26t-25-10H321q-14 0-25 10t-10 26v285q0 15 10 25t25 11h429q15 0 25-11t11-25zm214 215v-72q0-14-11-25t-25-11h-71q-15 0-25 11t-11 25v72q0 14 11 25t25 10h71q15 0 25-10t11-25zm0-215v-71q0-15-11-25t-25-11h-71q-15 0-25 11t-11 25v71q0 15 11 25t25 11h71q15 0 25-11t11-25zm0-214v-71q0-15-11-26t-25-10h-71q-15 0-25 10t-11 26v71q0 14 11 25t25 11h71q15 0 25-11t11-25zm71-89v750q0 37-26 63t-63 26H89q-36 0-63-26T0 958V208q0-37 26-63t63-27h893q37 0 63 27t26 63z\"/>"
    },
    "fire-exit": {
        "viewBox": "-10 0 1020 1000",
        "path": "<path fill=\"currentColor\" d=\"M0 500v-500h500h500v500v500h-500h-500v-500zM570 957q35 -31 48 -37q12 -5 50 -5h38l-37 34q-36 36 -36 37q0 3 53 3h53l32 -32l33 -33v-208v-209h-66q-66 0 -74 -5q-11 -8 -34 -41q-28 -35 -30 -35t-28 57l-27 58l87 176q87 176 87 178q0 1 -43 1q-42 -1 -52 -9 q-12 -9 -76 -136q-66 -128 -76 -145l-10 -19l-9 80q-7 78 -12 88q-8 14 -32 16.5t-144 2.5h-151l3 -8q10 -32 29 -46q18 -13 41 -17t90 -6q81 -1 86 -6q3 -7 7 -63q6 -82 12.5 -109t33.5 -79q32 -60 32 -64q0 -3 -39 -1l-40 1l-32 53q-30 51 -42 59q-11 5 -23.5 2.5 t-18.5 -11.5q-9 -13 -3.5 -29.5t34.5 -63.5q30.9648 -51.1865 39.8105 -59.0293q17.1572 -15.2109 72.3438 -15.9561q1.05957 -0.0146484 70.8457 -0.0146484q116 0 131 7q20 9 74 79l34 44h49h49v-189v-189h-302h-302v309v308l-15 3q-37 5 -63 35q-13 15 -26 46l-14 30 l57 1l57 1v66v66l-30 30l-31 31h200h200zM561 288q-46 -17 -46 -68q0 -28 18 -47q18 -21 50 -21q28 0 47 15.5t24 41.5q6 40 -25 66t-68 13z\"/>"
    },
    "group": {
        "viewBox": "-11 0 1092 1000",
        "path": "<path fill=\"currentColor\" d=\"M331 500q-90 3 -148 71h-75q-45 0 -77 -22t-31 -66q0 -197 69 -197q4 0 25 11t54 24t66 12q38 0 75 -13q-3 21 -3 37q0 78 45 143zM929 856q0 66 -41 105t-108 39h-488q-68 0 -108 -39t-41 -105q0 -30 2 -58t8 -61t14 -61t24 -54t35 -45t48 -30t62 -11q6 0 24 12t41 26 t59 27t76 12t75 -12t60 -27t41 -26t24 -12q34 0 62 11t47 30t35 45t24 54t15 61t8 61t2 58zM357 143q0 59 -42 101t-101 42t-101 -42t-42 -101t42 -101t101 -42t101 42t42 101zM750 357q0 89 -63 152t-151 62t-152 -62t-63 -152t63 -151t152 -63t151 63t63 151zM1071 483 q0 43 -31 66t-77 22h-75q-57 -68 -147 -71q45 -65 45 -143q0 -16 -3 -37q37 13 74 13q33 0 67 -12t54 -24t24 -11q69 0 69 197zM1000 143q0 59 -42 101t-101 42t-101 -42t-42 -101t42 -101t101 -42t101 42t42 101z\"/>"
    },
    "laptop": {
        "viewBox": "-10 0 1270 1000",
        "path": "<path fill=\"currentColor\" d=\"M1145 711q45 10 75 46t30 81q0 54 -38 92t-92 39h-990q-54 0 -92 -39t-38 -92q0 -46 30 -81t75 -46q0 -8 -1 -26t0 -29v-469q0 -65 45 -110t111 -46h730q65 0 111 46t45 110v469v29t-1 26zM209 187v469v29t1 23h50v-468q0 -22 16 -37t37 -16h625q21 0 36 16t16 37v468h51 v-521q0 -21 -15 -37t-36 -15h-730q-21 0 -36 15t-15 37zM938 708v-468h-625v468h625zM1120 865q10 0 18 -8t8 -19t-8 -18t-18 -8h-990q-10 0 -18 8t-8 18t8 19t18 8h990z\"/>"
    },
    "lock": {
        "viewBox": "-10 0 663 1000",
        "path": "<path fill=\"currentColor\" d=\"M179 429h285v-108q0 -59 -42 -101t-101 -41t-101 41t-41 101v108zM643 482v322q0 22 -16 37t-38 16h-535q-23 0 -38 -16t-16 -37v-322q0 -22 16 -38t38 -15h17v-108q0 -102 74 -176t176 -74t177 74t73 176v108h18q23 0 38 15t16 38z\"/>"
    },
    "monitor": {
        "viewBox": "-10 0 1020 1000",
        "path": "<path fill=\"currentColor\" d=\"M900 60q42 0 71 30t29 70v550q0 42 -29 77t-69 43l-218 44l86 38q50 28 -20 28h-500q-98 0 32 -52l36 -14l-220 -44q-40 -8 -69 -43t-29 -77v-550q0 -40 30 -70t70 -30h800zM900 706v-556h-800v556h800z\"/>"
    },
    "mortarboard": {
        "viewBox": "-10 0 1020 1000",
        "path": "<path fill=\"currentColor\" d=\"M166 612l334 168l276 -136q-4 22 -8 47t-6 35t-11 23t-24 23t-45 22q-40 18 -80 41t-63 34t-39 11t-40 -13t-64 -37t-80 -40q-72 -32 -103 -69t-47 -109zM976 366q24 14 24 33t-24 33l-78 44l-308 -102q-22 -36 -90 -36q-40 0 -67 16t-27 40t27 40t67 16q26 0 36 -4 l292 68l-268 152q-60 32 -120 0l-416 -234q-24 -14 -24 -33t24 -33l416 -234q60 -32 120 0zM848 808q18 -116 13 -182t-19 -90l-14 -22l70 -38q6 8 12 28t17 101t-7 197q-4 26 -22 30t-35 -5t-15 -19z\"/>"
    },
    "prayer": {
        "viewBox": "-10 0 925 1000",
        "path": "<path fill=\"currentColor\" d=\"M135 865q-135 -135 -135 -141t42 -48t51 -45q15 -6 34.5 -2t25.5 15q2 3 27 -11t33 -22q8 -11 12 -20q4 -12 -1 -81q-6 -79 1.5 -110.5t70.5 -194.5q72 -183 77 -188q17 -17 41 -17q17 0 28 7l10 6l14 -6q14 -7 26 -7q27 0 42 21q6 8 63 156q37 96 68 173q15 37 17.5 64 t-1.5 90q-4 57 -3.5 73.5t8.5 28.5q4 5 30 22.5t30 17.5q2 0 13 -7q23 -15 48 -8q14 4 55 45q43 42 43 50t-133 141q-93 92 -115 112.5t-28 20.5q-10 0 -50 -41q-41 -41 -44 -49q-12 -36 11 -59l7 -8l-9 -7q-60 -50 -75 -70q-14 -20 -14 -21q0 -8.08203 -5.48438 0 q-1.43164 2.11035 -2.51562 5q-5 9 -30 34.5t-42 38.5t-19.5 18t3.5 10q10 7 13 26.5t-3 31.5q-4 9 -46 50t-47 41q-8 0 -141 -135zM829 694q-32 -32 -38 -32q-7 0 -115.5 111t-108.5 118q0 4 31 37l31 31l116 -117l117 -116zM308 926q30 -30 30 -39t-108 -117t-115 -108 q-8 0 -40 32l-32 32l115 115q114 114 118 114q3 0 32 -29zM348 799q57 -46 70 -70q31 -61 5 -187q-9 -47 -9 -75.5t9 -85.5q10 -55 10 -70q0 -16 -15 -22.5t-26 4.5q-8 8 -48 139q-12 36 -30 27q-8 -4 -10 -9q-1 -6 24.5 -86.5t31.5 -89.5q5 -8 17 -14l11 -6l23 -101 q17 -75 19 -89t-1 -21q-5 -7 -14 -8t-14 6q-6 6 -73 180t-70 190q-3 17 2 93q4 80 3 85q-9 42 -57 70q-18 10 -20 13q-1 3 67.5 73t71.5 70t23 -16zM651 746q69 -69 69 -71t-22 -15q-45 -28 -53 -60q-5 -17 0 -93q5 -73 2 -94q-4 -22 -72 -196t-74 -178q-7 -5 -15.5 -2.5 t-11.5 9.5t20 108l23 100l11 8q12 8 17 15q7 10 32 89q18 58 21 70t-1 18q-9 15 -24 4q-4 -3 -30 -81q-24 -77 -32 -83q-14 -13 -31 -1q-8 7 -8 20t9 70q10 57 10 86.5t-9 67.5q-8 38 -10 87.5t4 72.5q7 30 20 46.5t53 50.5q25 21 29 21q2 0 73 -69zM455 467q0 -34 -3 -34 q-2 0 -2.5 31t1.5 34q3.13965 3.13965 3.63184 -2.95508q0.368164 -4.56152 0.368164 -28.0449zM466 260l14 -8l-13 -58q-13 -57 -15 -57q-1 0 -14 56l-13 57l10 5q11 7 12 9q2 3 4.5 2.5t14.5 -6.5z\"/>"
    },
    "print": {
        "viewBox": "-11 0 950 1000",
        "path": "<path fill=\"currentColor\" d=\"M214 857h500v-143h-500v143zM214 500h500v-214h-89q-22 0 -38 -16t-16 -38v-89h-357v357zM857 536q0 -15 -10 -25t-26 -11t-25 11t-10 25t10 25t25 10t26 -10t10 -25zM929 536v232q0 7 -6 12t-12 6h-125v89q0 22 -16 38t-38 16h-536q-22 0 -37 -16t-16 -38v-89h-125 q-7 0 -13 -6t-5 -12v-232q0 -44 32 -76t75 -31h36v-304q0 -22 16 -38t37 -16h375q23 0 50 12t42 26l85 85q15 16 27 43t11 49v143h35q45 0 76 31t32 76z\"/>"
    },
    "recycle": {
        "viewBox": "-10 0 877 1000",
        "path": "<path fill=\"currentColor\" d=\"M707 150l150 -150v405h-405l153 -153q-77 -62 -176 -62q-111 0 -193 76t-92 186h-143q9 -170 133 -287t295 -117q157 0 278 102zM429 810q111 0 193 -76t91 -186h143q-9 170 -133 287t-294 117q-158 0 -279 -102l-150 150v-405h405l-153 153q78 62 177 62z\"/>"
    },
    "refuge": {
        "viewBox": "-11 0 1080 1000",
        "path": "<path fill=\"currentColor\" d=\"M611 996q-29 -11 -36 -41q-4 -14 1 -34q8 -32 30.5 -142.5t21.5 -111.5q-1 -3 -70.5 -64t-71.5 -61q-1 0 -62 70q-38 44 -50.5 57t-17.5 13q-1 0 -23.5 1t-62.5 2t-77 2l-155 6l-11 -9q-21 -16 -26 -39t8 -42q11.7715 -16.6191 24.1465 -19.9688 q16.3613 -4.42969 118.854 -6.03125q113 -1 122 -8q5 -4 153 -173.5t147 -170.5l-5 -0.5q-5 -0.5 -14 -1t-17 -0.5l-35 -2l-63 67q-62 67 -69 81q-10 25 -34 31.5t-43 -10.5q-13 -10 -17 -27t3 -31q4 -9 93 -104l89 -95l113 -3l114 -2l78 58q54 40 66 51t13 19q4 22 5 52 q1 9 2 21.5t2 20t1 10.5l2 10l84 1q61 1 73.5 2t19.5 6q17 13 22 32.5t-6 35.5q-11 17 -27.5 19t-109.5 0l-112 -2l-18 -8q-19 -9 -24.5 -20.5t-6.5 -48.5l-2 -39l-52 61l-52 61l56 56q55 55 59 63t4 20q0 9 -39.5 176.5t-44.5 180.5q-3 9 -14 18.5t-22 12.5q-18 4 -35 -1z M801 181q-14 -5 -29.5 -20t-22.5 -30q-11 -26 -5 -57.5t27 -49.5q27 -24 65 -24q26 0 44 9q34 20 45 52q12 37 -5 72q-17 36 -52 48q-34 11 -67 0z\"/>"
    },
    "selfissue": {
        "viewBox": "-10 0 1208 1000",
        "path": "<path fill=\"currentColor\" d=\"M912 236l276 266l-276 264v-177h-413v-176h413v-177zM746 748l106 107q-156 146 -338 146q-217 0 -365 -143t-149 -359q0 -135 68 -250t184 -182t250 -66q184 0 349 148l-105 106q-114 -104 -243 -104q-149 0 -251 104t-103 254q0 140 106 241t247 101q131 0 244 -103z\"/>"
    },
    "sensory": {
        "viewBox": "-10 0 904 1000",
        "path": "<path fill=\"currentColor\" d=\"M868 72q16 16 16 36t-16 36l-782 782q-18 14 -34 14q-18 0 -36 -14q-16 -14 -16 -36t16 -36l782 -782q34 -32 70 0zM652 458l50 -50q74 92 101 172t-7 116q-24 24 -75 57t-131 71t-161 45t-165 -23l278 -276q44 32 88 54t67 25t33 -1q6 -10 2 -34t-26 -68t-54 -88z M376 396l-270 270q-40 -132 28 -283t132 -215q34 -32 105 -11t159 85l-52 50q-58 -38 -105 -53t-57 -5q-4 8 -2 28t19 58t43 76z\"/>"
    },
    "skill": {
        "viewBox": "-11 0 946 1000",
        "path": "<path fill=\"currentColor\" d=\"M359 447q-35.4199 -1.21777 -60.1738 -26.7842t-24.7539 -61.1631q0 -36.4268 25.7871 -62.2129q25.7871 -25.7871 62.2129 -25.7871q35.8555 0 61.4746 25.0977q25.6191 25.0967 26.4531 60.8496q0 37 -26.5 63.5t-63.5 26.5h-0.5h-0.5zM917 595l-120 -180v-15 q0 -165 -116.5 -282t-281.5 -118q-0.967773 -0.00488281 -1.93652 -0.00488281q-47.2871 0 -93.0635 12.0049q-132.034 32.0908 -217.921 139.9q-85.8857 107.81 -85.8857 246.868q0 0.212891 -0.0966797 0.615234q-0.0976562 0.401367 -0.0966797 0.616211 q-0.174805 5.68945 -0.175781 11.4219q0 109.211 60.1758 200.578q62 88 85 151t4 137q-2.82812 10.125 -2.82812 20.7324q0 27.8662 17.8281 49.2676q21.915 30.0723 59.0342 30.0723q0.175781 0 0.489258 -0.0351562q0.3125 -0.0351562 0.476562 -0.0371094h326 q1.23926 0.0390625 2.48828 0.0390625q28.1914 0 49.6992 -17.9473q21.5068 -17.9473 26.8125 -45.0918q3 -10 3 -20q2.2002 -14.5107 13.4131 -24.2363q11.2129 -9.72656 26.1338 -9.72656l0.453125 -0.0371094h23q2.08301 0.110352 4.19336 0.111328 q26.2832 0 46.9482 -15.7559q20.666 -15.7559 27.8584 -40.3555q22 -79 25 -160h85q25 -4 36 -27q4.19629 -9.33398 4.19629 -19.6426q0 -13.7666 -7.19629 -25.3574zM587 455l-17 27q-11.1162 15.0332 -29.7676 15.0332l-0.232422 -0.0332031q-6 0 -11 -2l-44 -17 q-29 25 -65 37l-8 48q-2.14258 11.5986 -11.2852 19.2881q-9.1416 7.68848 -21.165 7.68848q-0.0878906 0 -0.270508 0.0126953q-0.181641 0.0126953 -0.279297 0.0107422h-34q-0.279297 0.00488281 -0.558594 0.00488281q-12.0195 0 -21.1582 -7.70117 q-9.13965 -7.7002 -11.2832 -19.3037l-7 -48q-34 -10 -61 -33l-47 16q-6.05859 1.99316 -12.4941 1.99316l-0.505859 0.00683594q-19 -1 -29 -17l-16 -26q-4.58887 -7.59668 -4.58887 -16.5107q0 -15.8994 12.5889 -25.4893l38 -32q-4 -17 -5 -35q1 -17 5 -33l-38 -33 q-12.6348 -9.625 -12.6348 -25.4697q0 -8.85742 4.63477 -16.5303l16 -28q9.43945 -17.0537 28.8936 -17.0537q0.216797 0 0.592773 0.0244141t0.513672 0.0292969q6 1 12 3l47 17q27 -23 61 -35l7 -47q2.12305 -11.1943 10.9717 -18.6025 q8.84961 -7.40918 20.4678 -7.40918q1.32422 0 1.56055 0.0117188h34q0.888672 -0.0488281 1.78906 -0.0488281q11.3418 0 20.0703 7.10254q8.72754 7.10352 11.1406 17.9463l8 48q34 11 62 33l47 -16q5 -3 11 -4q20 0 30 17l17 27q4.68262 7.80371 4.68262 16.9443 q0 16.1631 -12.6826 26.0557l-39 32q4 17 4 35q0 17 -4 33l39 32q12.7285 9.92871 12.7285 26.0342q0 9.08594 -4.72852 16.9658z\"/>"
    },
    "stairs": {
        "viewBox": "-10 0 1020 1000",
        "path": "<path fill=\"currentColor\" d=\"M1000 0v111h-222v222h-222v223h-223v222h-222v222h-111v-333h222v-223h222v-222h223v-222h333zM523 1000l477 -477v-157l-634 634h157z\"/>"
    },
    "tablet": {
        "viewBox": "-10 0 905 1000",
        "path": "<path fill=\"currentColor\" d=\"M678 109q21 0 36 15t15 36v625q0 22 -15 37t-36 16h-183q0 21 -16 37t-36 16t-37 -16t-16 -37h-181q-21 0 -37 -16t-16 -37v-625q0 -21 16 -36t37 -15h469zM678 785v-625h-469v625h469zM729 -47q65 0 110 46t46 110v782q0 65 -46 110t-110 46h-573q-65 0 -110 -46 t-46 -110v-782q0 -65 46 -110t110 -46h573zM781 891v-782q0 -21 -15 -37t-37 -15h-573q-21 0 -37 15t-15 37v782q0 21 15 36t37 15h573q21 0 37 -15t15 -36z\"/>"
    },
    "ticket": {
        "viewBox": "-10 0 1010 1000",
        "path": "<path fill=\"currentColor\" d=\"M571 252l177 177l-319 319l-177 -177zM454 798l345 -344q10 -11 10 -25t-10 -26l-202 -202q-10 -10 -26 -10t-25 10l-344 345q-11 11 -11 25t11 25l202 202q10 11 25 11t25 -11zM950 443l-506 507q-21 20 -51 20t-50 -20l-71 -70q32 -32 32 -76t-32 -76t-76 -32t-75 32 l-70 -71q-21 -20 -21 -50t21 -51l506 -505q21 -21 50 -21t51 21l70 69q-32 32 -32 76t32 76t76 32t76 -32l70 70q20 21 20 51t-20 50z\"/>"
    },
    "toilet-female": {
        "viewBox": "-11 0 485 1000",
        "path": "<path fill=\"currentColor\" d=\"M232 164q-34 0 -58.5 -24t-24.5 -58t24.5 -58t58.5 -24t58 24t24 58t-24 58t-58 24zM169 182q-3 0 -8.5 0.5t-20 4.5t-27 12.5t-26 27t-20.5 43.5l-65 226q-5 16 2 27.5t22 15.5q14 4 26 -2t16 -19l63 -221h18l-110 383h103v0v281q0 16 12 27.5t29 11.5q15 0 27.5 -12.5 t12.5 -28.5v0v-279h17v279v0q0 15 13 28t27 13q17 0 29 -11.5t12 -27.5v-281v0h104l-110 -383h17l63 221q4 13 16.5 19t26.5 2t21 -15.5t3 -27.5l-66 -226q-12 -40 -37 -62t-44.5 -24l-19.5 -2h-126z\"/>"
    },
    "toilet-male": {
        "viewBox": "-10 0 412 1000",
        "path": "<path fill=\"currentColor\" d=\"M196 164q34 0 58 -24t24 -58t-24 -58t-58 -24t-58 24t-24 58t24 58t58 24zM286 185q44 0 75 31t31 74v254q0 14 -10.5 25t-25.5 11q-14 0 -24.5 -11t-10.5 -25v-229h-19v637q0 20 -14 34t-34 14t-34 -14t-14 -34v-370h-20v370q0 20 -14 34t-34 14t-34 -14t-14 -34v-637 h-19v229q0 14 -10.5 25t-25.5 11q-14 0 -24.5 -11t-10.5 -25v-254q0 -44 31 -74.5t74 -30.5h181z\"/>"
    },
    "toilet": {
        "viewBox": "-10 0 1007 1000",
        "path": "<path fill=\"currentColor\" d=\"M194 167q34 0 57.5 -23.5t23.5 -57.5t-23.5 -57.5t-57.5 -23.5t-57.5 23.5t-23.5 57.5t23.5 57.5t57.5 23.5zM284 188q43 0 73.5 30.5t30.5 73.5v251q0 15 -10 25.5t-25 10.5t-25.5 -10.5t-10.5 -25.5v-227h-18v632q0 20 -14 33.5t-34 13.5q-19 0 -33 -13.5t-14 -33.5 v-367h-20v367q0 20 -14 33.5t-33 13.5q-20 0 -34 -13.5t-14 -33.5v-632h-18v227q0 15 -10.5 25.5t-25.5 10.5t-25 -10.5t-10 -25.5v-251q0 -43 30.5 -73.5t73.5 -30.5h180zM755 164q-34 0 -58.5 -24t-24.5 -58t24.5 -58t58.5 -24t58 24t24 58t-24 58t-58 24zM755 164 q-35 0 -59 -24q-24 -23 -24 -58q0 -34 24 -58t59 -24q34 0 58 24t24 58t-24 58t-58 24zM755 0q-33 0 -59 24q-24 26 -24 58t24 58q26 24 59 24q34 0 58 -24t24 -58t-24 -58t-58 -24zM692 182q-3 0 -8.5 0.5t-20 4.5t-27 12.5t-26 27t-20.5 43.5l-65 226q-5 16 2 27.5 t22 15.5q14 4 26 -2t16 -19l63 -221h17l-109 383h103v0v281q0 16 12 27.5t29 11.5q14 0 27 -13t13 -28v0v-279h17v279v0q0 15 12.5 28t27.5 13q17 0 29 -11.5t12 -27.5v-281v0h103l-109 -383h17l63 221q4 13 16 19t26 2q15 -4 22 -15.5t2 -27.5l-65 -226q-12 -40 -37.5 -62 t-45 -24l-19.5 -2h-125zM803 1000q-14 0 -27 -13q-13 -12 -13 -28v-279h-17v279q0 16 -13 28q-13 13 -27 13v0q-17 0 -29 -12q-12 -11 -12 -27v-281h-103v0l109 -383h-17l-63 221q-3 13 -16 19t-26 2q-16 -5 -22 -16q-7 -11 -2 -27l65 -226q9 -31 27 -52q14 -17 33 -26 q20 -10 42 -10h125q22 0 42 10q18 8 34 26q20 25 26 52l66 226q3 17 -3 27q-6 11 -22 16q-14 5 -27 -3q-12 -6 -15 -18l-63 -221h-17l110 383h-104v281q0 16 -12 27q-12 12 -29 12v0zM763 959q0 15 13 28t27 13v0q17 0 29 -12q12 -11 12 -27v-281v0h103l-110 -383h1h17v0 l63 221q3 11 15 18q13 8 27 3q16 -5 22 -17q6 -11 2 -26l-65 -226q-9 -31 -27 -52q-13 -16 -33 -26q-10 -4 -20 -6.5t-15.5 -3l-5.5 -0.5h-126q-20 0 -42 10q-20 10 -33 26q-18 21 -27 52l-65 226q-4 14 2 27q6 11 22 16q15 3 26 -2t16 -19l63 -221v0h18v0l-110 383h103v0 v281q0 15 12 27t29 12v0q14 0 27 -13t13 -28v-279h17v279z\"/>"
    },
    "undo": {
        "viewBox": "-10 0 938 1000",
        "path": "<path fill=\"currentColor\" d=\"M804 156q107 107 107 262q0 150 -107 257l-84 84l-79 -80l84 -84q74 -74 74 -177q0 -108 -74 -183q-72 -72 -180 -72t-180 72l-153 155h141v109h-335v-334h112v147l156 -156q103 -103 259 -103t259 103zM533 947l-79 -79l79 -81l79 81z\"/>"
    },
    "user": {
        "viewBox": "-10 0 734 1000",
        "path": "<path fill=\"currentColor\" d=\"M714 781q0 60 -35 104t-84 44h-476q-49 0 -84 -44t-35 -104q0 -48 5 -90t17 -85t33 -73t52 -50t76 -19q73 72 174 72t175 -72q42 0 75 19t52 50t33 73t18 85t4 90zM571 286q0 88 -62 151t-152 63t-151 -63t-63 -151t63 -152t151 -63t152 63t62 152z\"/>"
    },
    "water": {
        "viewBox": "-11 0 1021 1000",
        "path": "<path fill=\"currentColor\" d=\"M2 207q7.79492 -19.5234 28.8027 -19.5234q6.30762 0 12.1973 2.52344l110 44q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l64 -26q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l63 26q16.751 6.71973 34.9443 6.71973 q18.3047 0 35.0557 -6.71973l63 -26q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l64 26q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l110 -44q5.50879 -2.18457 11.4824 -2.18457q12.9131 0 22.0557 9.1416 q9.1416 9.1416 9.1416 22.0557q0 21.1836 -19.6797 28.9873l-109 44q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-63 -26q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 26q-27.7617 11.1191 -57.9092 11.1191 q-30.3291 0 -58.0908 -11.1191l-63 -26q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 26q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-109 -44q-20.3789 -7.44141 -20.3789 -29.1299q0 -6.1377 2.37891 -11.8701zM2 395 q7.44141 -20.3789 29.1299 -20.3789q6.1377 0 11.8701 2.37891l110 44q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l64 -25q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l63 25q16.751 6.71973 34.9443 6.71973 q18.3047 0 35.0557 -6.71973l63 -25q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l64 25q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l110 -44q5.50879 -2.18457 11.4824 -2.18457q12.9131 0 22.0557 9.1416 q9.1416 9.1416 9.1416 22.0557q0 21.1836 -19.6797 28.9873l-109 44q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-63 -25q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 25q-27.7617 11.1191 -57.9092 11.1191 q-30.3291 0 -58.0908 -11.1191l-63 -25q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 25q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-109 -44q-20.0352 -7.58789 -20.0352 -29.002q0 -5.6416 2.03516 -10.998zM2 582 q7.79492 -19.5234 28.8027 -19.5234q6.30762 0 12.1973 2.52344l110 44q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l64 -26q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l63 26q16.751 6.71973 34.9443 6.71973 q18.3047 0 35.0557 -6.71973l63 -26q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l64 26q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l110 -44q5.50879 -2.18457 11.4824 -2.18457q12.9131 0 22.0557 9.1416 q9.1416 9.1416 9.1416 22.0557q0 21.1836 -19.6797 28.9873l-109 44q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-63 -26q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 26q-27.7617 11.1191 -57.9092 11.1191 q-30.3291 0 -58.0908 -11.1191l-63 -26q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 26q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-109 -44q-20.3789 -7.44141 -20.3789 -29.1299q0 -6.1377 2.37891 -11.8701zM2 770 q7.44141 -20.3789 29.1299 -20.3789q6.1377 0 11.8701 2.37891l110 44q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l64 -25q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l63 25q16.751 6.71973 34.9443 6.71973 q18.3047 0 35.0557 -6.71973l63 -25q27.7617 -11.1191 57.9092 -11.1191q30.3291 0 58.0908 11.1191l64 25q16.5312 6.52246 34.4482 6.52246q18.0205 0 34.5518 -6.52246l110 -44q5.50879 -2.18457 11.4824 -2.18457q12.9131 0 22.0557 9.1416 q9.1416 9.1416 9.1416 22.0557q0 21.1836 -19.6797 28.9873l-109 44q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-63 -25q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 25q-27.7617 11.1191 -57.9092 11.1191 q-30.3291 0 -58.0908 -11.1191l-63 -25q-16.751 -6.71973 -34.9443 -6.71973q-18.3047 0 -35.0557 6.71973l-63 25q-27.9805 11.3184 -58.4053 11.3184q-30.6143 0 -58.5947 -11.3184l-109 -44q-20.0352 -7.58789 -20.0352 -29.002q0 -5.6416 2.03516 -10.998z\"/>"
    },
    "wellbeing": {
        "viewBox": "-11 0 1163 1000",
        "path": "<path fill=\"currentColor\" d=\"M703 42l-52 156l-52 -156q-8 -22 3 -42t32 -28q29 -10 54 12t15 58zM983 200l-148 74l74 -147q10 -20 32 -27t42 3q31 16 30 49t-30 48zM1068 510l-157 -52l157 -51q21 -8 41 2t29 31q10 29 -13 55t-57 15zM394 127l74 147l-148 -74q-21 -10 -28 -31t3 -42q16 -32 50 -30 t49 30zM874 528q75 29 121 94t46 148q0 108 -76 185t-184 77h-572q-86 0 -148 -62t-61 -147q0 -73 44 -128t112 -73v-8q0 -62 23 -117q-30 -28 -9 -67t66 -23q95 -105 233 -105h4t3 1q69 -79 175 -79q97 0 165 69t69 165q0 36 -11 70zM651 328q-55 0 -95 42q110 39 154 152 q26 -8 59 -10q12 -28 12 -54q0 -54 -38 -92t-92 -38zM781 614q-7 0 -27 4t-30 5q-39 0 -49 -38q-1 -1 -2 -5t0 -5q-14 -72 -70 -120t-130 -50h-2q-1 2 -2 2q-86 0 -148 60t-61 147q0 15 5 43l13 62l-74 -1q-40 0 -70 31t-30 74t30 73t75 31h572q65 0 111 -46t46 -111 t-46 -110t-111 -46z\"/>"
    },
    "wheelchair": {
        "viewBox": "-10 0 938 1000",
        "path": "<path fill=\"currentColor\" d=\"M571 662l57 114q-33 100 -117 162t-190 62q-87 0 -161 -43t-117 -117t-43 -161q0 -101 58 -185t154 -117l9 73q-68 30 -109 92t-41 137q0 103 74 176t176 74q71 0 130 -37t92 -98t28 -132zM877 718l32 64l-143 71q-7 4 -16 4q-22 0 -32 -19l-133 -267h-264q-13 0 -23 -9 t-12 -22l-54 -435q-1 -10 4 -24q7 -28 31 -46t54 -17q37 0 64 26t26 63q0 39 -29 66t-67 23l20 161h236v72h-227l9 71h254q23 0 32 19l127 254z\"/>"
    },
    "wrench": {
        "viewBox": "-10 0 948 1000",
        "path": "<path fill=\"currentColor\" d=\"M214 821q0 -14 -10 -25t-25 -10t-25 10t-11 25t11 25t25 11t25 -11t10 -25zM574 587l-381 381q-21 20 -50 20t-51 -20l-59 -61q-21 -20 -21 -50q0 -29 21 -51l380 -380q22 55 64 97t97 64zM928 344q0 22 -13 59q-27 75 -92 122t-144 46q-104 0 -177 -73t-73 -177t73 -176 t177 -74q32 0 67 10t60 26q9 6 9 15t-9 16l-163 94v125l108 60q2 -2 44 -27t75 -45t40 -20q8 0 13 5t5 14z\"/>"
    }
};
