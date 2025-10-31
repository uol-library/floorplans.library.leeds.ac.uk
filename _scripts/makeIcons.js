const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const { parseSVG } = require("svg-parser");

const options = {
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    allowBooleanAttributes: true,
    unpairedTags: "path",
    suppressUnpairedNode: false
};
var icons = {};
const parser = new XMLParser(options);
const builder = new XMLBuilder(options);
const iconFiles = fs.readdirSync( path.resolve( __dirname, '../assets/icons' ), { encoding: 'utf8' } );
iconFiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let iconName = filename.replace('.svg', '');
        let iconData = fs.readFileSync( path.resolve( __dirname, '../assets/icons', filename ), { encoding: 'utf8' } );
        let iconXML = parser.parse(iconData);
        let viewBox = iconXML.svg['@_viewBox'];
        let pathElement = builder.build(iconXML.svg).replace(/\n/g, ' ');
        icons[iconName] = { 'viewBox': viewBox, 'path': pathElement };
    }
});
fs.writeFileSync( path.resolve( __dirname, '../_includes/javascript/icons.js' ), 'floorplans.icons = ' + JSON.stringify(icons, null, 4) + ';', { encoding: 'utf8' } );