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
        let baseURI = "https://floorplans.library.leeds.ac.uk/assets/iiif/"+floorID+"/";
        let XMLdata = fs.readFileSync( path.resolve( __dirname, '../assets/svg/', filename ) );
        let jsondata = parser.parse(XMLdata);
        console.log(jsondata);
        let manifest = {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": baseURI+"manifest.json",
            "type": "Manifest",
            "label": { "en": [ metadata[floorID].title ] },
            "items": [
                {
                    "id": baseURI+"canvas/p1",
                    "type": "Canvas",
                    "height": parseInt(jsondata.svg['@_viewBox'].split(',')[2])+metadata[floorID].adjust_y,
                    "width": parseInt(jsondata.svg['@_viewBox'].split(',')[3])+metadata[floorID].adjust_y,
                    "items": getAnnotations(floorID, jsondata)
                }
            ]
        };
        fs.writeFileSync( path.resolve( __dirname, '../assets/iiif/', floorID, 'manifest.json'), JSON.stringify( manifest, null, 4 ) );
    }
});
function getAnnotations(floorID, jsondata) {
    return [];
}
// {
//   "@context": "http://iiif.io/api/presentation/3/context.json",
//   "id": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/manifest.json",
//   "type": "Manifest",
//   "label": { "en": [ metadata[floorID].title ] },
//   "items": [
//     {
//       "id": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/canvas/p1",
//       "type": "Canvas",
//       "height": 3024,
//       "width": 4032,
//       "items": [
//         {
//           "id": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/page/p1/1",
//           "type": "AnnotationPage",
//           "items": [
//             {
//               "id": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/annotation/p0001-image",
//               "type": "Annotation",
//               "motivation": "painting",
//               "body": {
//                 "id": "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
//                 "type": "Image",
//                 "format": "image/jpeg",
//                 "height": 3024,
//                 "width": 4032,
//                 "service": [
//                   {
//                     "id": "https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
//                     "profile": "level1",
//                     "type": "ImageService3"
//                   }
//                 ]
//               },
//               "target": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/canvas/p1"
//             }
//           ]
//         }
//       ],
//       "annotations": [
//         {
//           "id": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/page/p2/1",
//           "type": "AnnotationPage",
//           "items": [
//             {
//               "id": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/annotation/p0002-svg",
//               "type": "Annotation",
//               "motivation": "tagging",
//               "body": {
//                 "type": "TextualBody",
//                 "value": "Gänseliesel-Brunnen",
//                 "language": "de",
//                 "format": "text/plain"
//               },
//               "target": {
//                 "type": "SpecificResource",
//                 "source": "https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/canvas/p1",
//                 "selector": {
//                   "type": "SvgSelector",
//                   "value": "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><path d='M270.000000,1900.000000 L1530.000000,1900.000000 L1530.000000,1610.000000 L1315.000000,1300.000000 L1200.000000,986.000000 L904.000000,661.000000 L600.000000,986.000000 L500.000000,1300.000000 L270,1630 L270.000000,1900.000000' /></g></svg>"
//                 }
//               }
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }