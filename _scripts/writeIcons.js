import fs from 'fs';
import path from 'path';
import { XMLParser } from "fast-xml-parser";
import XMLBuilder from "fast-xml-builder";
const __dirname = import.meta.dirname;

const options = {
    ignoreAttributes: [/^(?!(viewBox|d))$/],
    attributeNamePrefix : "@_",
    allowBooleanAttributes: true,
    unpairedTags: "path",
    suppressUnpairedNode: false,
    format: false,
};
var icons = {};
const parser = new XMLParser(options);
const builder = new XMLBuilder(options);
const iconFiles = fs.readdirSync( path.resolve( __dirname, '../assets/icons' ), { encoding: 'utf8' } );
iconFiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename.endsWith('.svg') ) {
        let iconName = filename.replace('.svg', '');
        let iconData = fs.readFileSync( path.resolve( __dirname, '../assets/icons', filename ), { encoding: 'utf8' } );
        let iconXML = parser.parse(iconData);
        let viewBox = iconXML.svg['@_viewBox'];
        let pathDrawAttr = iconXML.svg.path['@_d'];
        let pathElement = builder.build({'path': {'@_d': pathDrawAttr}});
        icons[iconName] = { 'viewBox': viewBox, 'path': pathElement };
    }
});
fs.writeFileSync( path.resolve( __dirname, '../_includes/javascript/icons.js' ), 'floorplans.icons = ' + JSON.stringify(icons, null, 4) + ';', { encoding: 'utf8' } );