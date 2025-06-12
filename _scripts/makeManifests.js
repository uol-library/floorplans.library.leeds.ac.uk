const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const fs = require('fs');
const path = require('path');

const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
};
const parser = new XMLParser(options);
const featuresXML = fs.readdirSync( path.resolve( __dirname, '../assets/svg' ), { encoding: 'utf8' } );
const metadata = {
    "brotherton-m1": {
        "title": "Brotherton Library Main Building - level 1",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "brotherton-m2": {
        "title": "Brotherton Library Main Building - level 2",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "brotherton-m3": {
        "title": "Brotherton Library Main Building - level 3",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "brotherton-m4": {
        "title": "Brotherton Library Main Building - level 4",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "brotherton-w2": {
        "title": "Brotherton Library West Wing - level 3",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "brotherton-w3": {
        "title": "Brotherton Library West Wing - level 3",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "edwardboyle-10": {
        "title": "Edward Boyle Library - level 10",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "edwardboyle-11": {
        "title": "Edward Boyle Library - level 11",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "edwardboyle-12": {
        "title": "Edward Boyle Library - level 12",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "edwardboyle-13": {
        "title": "Edward Boyle Library - level 13",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "edwardboyle-8": {
        "title": "Edward Boyle Library - level 8",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "edwardboyle-9": {
        "title": "Edward Boyle Library - level 9",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "health-sciences": {
        "title": "Health Sciences Library",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "laidlaw-first": {
        "title": "Laidlaw Library - First Floor",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "laidlaw-ground": {
        "title": "Laidlaw Library - Ground Floor",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "laidlaw-second": {
        "title": "Laidlaw Library - Second Floor",
        "adjust_x": 0,
        "adjust_y": 0,
    },
    "laidlaw-third": {
        "title": "Laidlaw Library - Third Floor",
        "adjust_x": 0,
        "adjust_y": 0,
    }
};

featuresXML.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let floorID = filename.substring(0,filename.length-4);
        let baseURI = "https://uol-library.github.io/floorplans.library.leeds.ac.uk/assets/iiif/"+floorID;
        let XMLdata = fs.readFileSync( path.resolve( __dirname, '../assets/svg/', filename ) );
        let svgdata = parser.parse(XMLdata);
        console.log(svgdata.svg.polygon);
        let manifest = {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": baseURI+"/manifest.json",
            "type": "Manifest",
            "label": { "en": [ metadata[floorID].title ] },
            "items": [
                {
                    "id": baseURI+"/canvas/p1",
                    "type": "Canvas",
                    "height": parseInt(svgdata.svg['@_viewBox'].split(',')[2])+metadata[floorID].adjust_y,
                    "width": parseInt(svgdata.svg['@_viewBox'].split(',')[3])+metadata[floorID].adjust_y,
                    "label": { "en": [ metadata[floorID].title ] },
                    "items": [
                        {
                            "id": baseURI+"/canvas/p1/1",
                            "type": "AnnotationPage",
                            "items": [
                                {  
                                    "@context": "http://iiif.io/api/presentation/3/context.json",
                                    "id": baseURI+"/canvas/p1/1/image",
                                    "type": "Annotation",
                                    "motivation": "painting",
                                    "body": {
                                        "id": baseURI+"/full/max/0/default.jpg",
                                        "type": "Image",
                                        "label": { "en": [ metadata[floorID].title ] },
                                        "format": "image/jpeg",
                                        "service": [
                                            {
                                                "id": baseURI,
                                                "type": "ImageService3",
                                                "profile": "level0",
                                            }
                                        ],
                                        "height": parseInt(svgdata.svg['@_viewBox'].split(',')[2])+metadata[floorID].adjust_y,
                                        "width": parseInt( svgdata.svg['@_viewBox'].split(',')[3])+metadata[floorID].adjust_y,
                                    },
                                    "target": baseURI + "/canvas/p1"
                                }
                            ]
                        }
                    ],
                    "annotations":  [
                        {
                            "id": baseURI + "/canvas/p1/2",
                            "type": "AnnotationPage",
                            "items": getAnnotations( baseURI, svgdata, metadata[floorID] )
                        }
                    ]
                }
            ]
        };
        fs.writeFileSync( path.resolve( __dirname, '../assets/iiif/', floorID, 'manifest.json'), JSON.stringify( manifest, null, 4 ) );
    }
});
function getAnnotations( baseURI, svgdata, metadata ) {
    let annotations = [];
    if (svgdata.svg.polygon.length) {
        let counter = 1;
        svgdata.svg.polygon.forEach( a => {
            counter++;
            let pointsArr = a['@_points'].split(' ');
            let pointsArrAdjusted = [];
            pointsArr.forEach( p => {
                let points = p.split(',');
                pointsArrAdjusted.push( ( parseInt( points[0] ) + metadata.adjust_x ) + ',' + ( parseInt( points[1] ) + metadata.adjust_y ) );
            });
            let newpoints = pointsArrAdjusted.join(' ');
            annotations.push(
                {
                    "id": baseURI + "page/p2/" + counter + "/annotation/p" + counter + "-svg",
                    "type": "Annotation",
                    "motivation": "tagging",
                    "body": {
                        "type": "TextualBody",
                        "value": a.title,
                        "language": "en",
                        "format": "text/plain"
                    },
                    "target": {
                        "type": "SpecificResource",
                        "source": baseURI + "/canvas/p1",
                        "selector": {
                            "type": "SvgSelector",
                            "value": "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><polygon points=\"" + newpoints + "\" fill=\"" + a['@_fill'] + "\" cursor=\"pointer\"><title>" + a.title + "</title></polygon></g></svg>"
                        }
                    }
                }
            );
        });
    }
    return annotations;
}
