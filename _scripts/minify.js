/**
 * Minifies javascript using UglifyJS and minifies features JSON
 */
const fs = require('fs');
const path = require('path');
const UglifyJS = require("uglify-js");

const jsdir = '../_includes/javascript/';
fs.writeFileSync( path.resolve( __dirname, '../assets/scripts/bundle.min.js' ), UglifyJS.minify({
     "utilities.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'utilities.js' ), "utf8" ),
     "pole-of-inaccessibility.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'pole-of-inaccessibility.js' ), "utf8" ),
     "core.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'core.js' ), "utf8" ),
     "routing.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'routing.js' ), "utf8" ),
     "selectercontrol.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'selectercontrol.js' ), "utf8" ),
     "occupancycontrol.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'occupancycontrol.js' ), "utf8" )
}, { toplevel: true } ).code, "utf8" );

const featuresJSON = fs.readdirSync( path.resolve( __dirname, '../assets/features' ), { encoding: 'utf8' } );
featuresJSON.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let data = fs.readFileSync( path.resolve( __dirname, '../assets/features/', filename ) );
        let jsondata = JSON.parse( data );
        fs.writeFileSync( path.resolve( __dirname, '../assets/features/', filename ), JSON.stringify( jsondata ) );
    }
});

fs.writeFileSync( path.resolve( __dirname, '../assets/scripts/editor-bundle.min.js' ), UglifyJS.minify({
     "utilities.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'utilities.js' ), "utf8" ),
     "pole-of-inaccessibility.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'pole-of-inaccessibility.js' ), "utf8" ),
     "editor.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'editor.js' ), "utf8" ),
     "selectercontrol.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'editorcontrol.js' ), "utf8" )
}, { toplevel: true } ).code, "utf8" );
