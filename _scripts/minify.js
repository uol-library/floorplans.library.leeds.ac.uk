/**
 * Minifies javascript using UglifyJS and SVG using SVGO
 */
const fs = require('fs');
const path = require('path');
const UglifyJS = require("uglify-js");

const jsdir = '../_includes/javascript/';
fs.writeFileSync( path.resolve( __dirname, '../assets/scripts/bundle.min.js' ), UglifyJS.minify({
     "utilities.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'utilities.js' ), "utf8" ),
     "core.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'core.js' ), "utf8" )
}, { toplevel: true } ).code, "utf8" );
