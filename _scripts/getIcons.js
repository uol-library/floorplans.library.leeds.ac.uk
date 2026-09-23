import fs from 'fs';
import path from 'path';
import { parse } from 'svg-parser';
const __dirname = import.meta.dirname;

const iconFiles = fs.readdirSync( path.resolve( __dirname, '../assets/icons' ), { encoding: 'utf8' } );
const iconsJSON = {};
iconFiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename.endsWith('.svg') ) {
        let iconData = fs.readFileSync( path.resolve( __dirname, '../assets/icons', filename ) );
        let iconJSON = parse( iconData );
        console.log("Parsed icon: " + filename);
        console.log(iconJSON);
    }
});
