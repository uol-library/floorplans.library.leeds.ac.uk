/**
 * Test setup, loaded before the tests with node --import (see npm test)
 *
 * assets/js/modules/config.mjs is a Jekyll template, so it can't be imported
 * directly. This registers a module hook which serves a rendered version of it,
 * built from the includes it uses, with the Liquid tags filled in from the
 * production config (_config.yml layered with _config_prod.yml).
 */
import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const root = path.resolve( import.meta.dirname, '..' );

/**
 * Reads a top level value from a Jekyll config file (enough for simple
 * key: "value" lines, which is all the tests need)
 */
function configValue( file, key ) {
    let yaml = fs.readFileSync( path.join( root, file ), 'utf8' );
    let match = yaml.match( new RegExp( '^' + key + ':\\s*"?([^"\\n]*)"?\\s*$', 'm' ) );
    return match ? match[1] : undefined;
}

const site = {
    version: configValue( '_config.yml', 'version' ),
    url: configValue( '_config_prod.yml', 'url' ) ?? configValue( '_config.yml', 'url' ),
    baseurl: configValue( '_config_prod.yml', 'baseurl' ) ?? configValue( '_config.yml', 'baseurl' )
};

/**
 * Renders the Liquid used in the JavaScript includes. Conditionals take their
 * {% else %} branch (so debug and redirect_primo_links are off - tests turn
 * them on through floorplans.conf where needed)
 */
function renderLiquid( source ) {
    return source
        .replace( /\{%-?\s*include\s+([^\s%]+)\s*-?%\}/g, ( m, file ) => renderLiquid( fs.readFileSync( path.join( root, '_includes', file ), 'utf8' ) ) )
        .replace( /\{%-?\s*if\b[\s\S]*?%\}[\s\S]*?\{%-?\s*else\s*-?%\}([\s\S]*?)\{%-?\s*endif\s*-?%\}/g, '$1' )
        .replace( /\{\{\s*site\.(\w+)\s*\}\}/g, ( m, key ) => site[ key ] ?? '' );
}

const configURL = pathToFileURL( path.join( root, 'assets/js/modules/config.mjs' ) ).href;

registerHooks({
    load( url, context, nextLoad ) {
        if ( url.split( '?' )[0] === configURL ) {
            let template = fs.readFileSync( new URL( configURL ), 'utf8' ).replace( /^---[\s\S]*?---\s*/, '' );
            return { format: 'module', source: renderLiquid( template ), shortCircuit: true };
        }
        return nextLoad( url, context );
    }
});
