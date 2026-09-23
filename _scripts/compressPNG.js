/**
 * Minifies javascript using UglifyJS and minifies features JSON
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
const __dirname = import.meta.dirname;

const srcPNG = fs.readdirSync( path.resolve( __dirname, '../assets/images/src' ), { encoding: 'utf8' } );
srcPNG.forEach( filename => {
    if ( filename.endsWith('.png') ) {
        sharp( path.resolve( __dirname, '../assets/images/src/', filename ) )
            .png({ compressionLevel: 9, palette: true, colours: 128})
            .toFile( path.resolve( __dirname, '../assets/images/', filename ) )
            .catch( err => {
                console.error( err );
            });
    }
});
