const path = require('path');

module.exports = {
    entry: path.resolve( __dirname, '_includes/javascript', 'main.js' ),
    mode: 'production',
    output: {
        filename: 'floorplans.js',
        path: path.resolve( __dirname, 'assets/scripts'),
    },
};