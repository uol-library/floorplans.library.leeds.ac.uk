const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const fs = require('fs');
const path = require('path');

/* get IIIF config data */
const configdata = fs.readFileSync( path.resolve( __dirname, '../_data/iiif.json' ) );
const configJSON = JSON.parse(configdata);

/* go through SVG files to get polygons */
const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
};
const parser = new XMLParser(options);
const featuresXML = fs.readdirSync( path.resolve( __dirname, '../assets/svg' ), { encoding: 'utf8' } );
featuresXML.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        for ( set of ['original','cropped'] ) {
            let floorID = filename.substring(0,filename.length-4);
            let baseURI = "https://uol-library.github.io/floorplans.library.leeds.ac.uk/assets/iiif/" + set + "/" + floorID;
            let XMLdata = fs.readFileSync( path.resolve( __dirname, '../assets/svg/', filename ) );
            let svgdata = parser.parse(XMLdata);
            let imgdata = fs.readFileSync( path.resolve( __dirname, '../assets/iiif/', set, floorID, 'info.json' ) );
            let imgJSON = JSON.parse(imgdata);
            let meta = getFloorMeta(floorID);
            let width = imgJSON.width;
            let height = imgJSON.height;
            let manifest = {
                "@context": "http://iiif.io/api/presentation/3/context.json",
                "id": baseURI+"/manifest.json",
                "type": "Manifest",
                "label": { "en": [ meta.title ] },
                "items": [
                    {
                        "id": baseURI + "/canvas/p1",
                        "type": "Canvas",
                        "width": width,
                        "height": height,
                        "label": { "en": [ meta.title ] },
                        "items": [
                            {
                                "id": baseURI + "/canvas/p1/1",
                                "type": "AnnotationPage",
                                "items": [
                                    {  
                                        "@context": "http://iiif.io/api/presentation/3/context.json",
                                        "id": baseURI+"/canvas/p1/1/image",
                                        "type": "Annotation",
                                        "motivation": "painting",
                                        "target": baseURI + "/canvas/p1",
                                        "body": {
                                            "id": baseURI+"/full/max/0/default.jpg",
                                            "type": "Image",
                                            "label": { "en": [ meta.title ] },
                                            "format": "image/jpeg",
                                            "service": [
                                                {
                                                    "@context": "http://iiif.io/api/image/2/context.json",
                                                    "id": baseURI,
                                                    "type": "ImageService3",
                                                    "profile": "level0",
                                                    "protocol": "http://iiif.io/api/image",
                                                    "tiles": [
                                                        {
                                                            "scaleFactors": [1, 2, 4, 8, 16, 32],
                                                            "width": 1024,
                                                            "height": 1024
                                                        }
                                                    ],
                                                    "width": width,
                                                    "height": height
                                                }
                                            ],
                                            "width": width,
                                            "height": height,
                                        }
                                    }
                                ]
                            }
                        ],
                        "annotations":  [
                            {
                                "id": baseURI + "/canvas/p1/2",
                                "type": "AnnotationPage",
                                "items": getAnnotations( baseURI, svgdata, meta, set, width, height )
                            }
                        ]
                    }
                ]
            };
            fs.writeFileSync( path.resolve( __dirname, '../assets/iiif/', set, floorID, 'manifest.json'), JSON.stringify( manifest, null, 4 ) );
        }
    }
});
function getAnnotations( baseURI, svgdata, metadata, set, width, height ) {
    let annotations = [];
    if (svgdata.svg.polygon.length) {
        let counter = 0;
        let svgDir = path.resolve( __dirname, '../assets/iiif/', set, metadata.key, 'svg')
        if ( ! fs.existsSync( svgDir ) ) {
            fs.mkdirSync( svgDir );
        } else {
            fs.readdirSync( svgDir ).forEach( f => fs.unlinkSync(`${svgDir}/${f}`) );
        }
        svgdata.svg.polygon.forEach( a => {
            counter++;
            let pointsArr = a['@_points'].split(' ');
            let pointsArrAdjusted = [];
            let adj_x = ( set === 'cropped' ) ? metadata.adjust_x: 0;
            let adj_y = ( set === 'cropped' ) ? metadata.adjust_y: 0;
            pointsArr.forEach( p => {
                let points = p.split(',');
                pointsArrAdjusted.push( ( parseInt( points[0] ) + adj_x) + ',' + ( parseInt( points[1] ) + adj_y ) );
            });
            let newpoints = pointsArrAdjusted.join(' ');
            let svgBody = "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0,0," + width + "," + height + "'><g><polygon fill='rgba(200,50,50,0.4)' stroke='rgba(200,50,50,0.8)' points='" + newpoints + "'><title>" + a.title + "</title></polygon></g></svg>";
            fs.writeFileSync( svgDir + '/p' + counter + '.svg', svgBody );
            annotations.push(
                {
                    "id": baseURI + "/canvas/p1/2/annotation" + counter + "-svg",
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
                            "value": svgBody
                        }
                    }
                }
            );
        });
    }
    return annotations;
}
function getFloorMeta(floorID) {
    for( lib of configJSON ) {
        for( f of lib.floors ) {
            if ( f.key === floorID ) {
                return f;
            }
        }
    }
    return "BASTARD!"
}