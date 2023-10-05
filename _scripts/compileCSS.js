const fs = require('fs');
const path = require('path');
const sass = require('sass');

const r = sass.compile( path.resolve( __dirname, '../_sass/style.scss' ), {style: 'compressed'} );

fs.writeFileSync( path.resolve( __dirname, '../assets/css/style.css' ), r.css );