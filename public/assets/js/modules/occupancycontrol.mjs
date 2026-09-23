import { Control, DomUtil } from 'leaflet';
import { floorplans } from './config.mjs';
import { getJSON, fplog } from './utilities.mjs';

/**
 * Displays occupancy data for two libraries
 * Set up data container - available is set to true once data has been
 * loaded for a library, so the control is only shown when there is data
 */
floorplans.occupancyData = {
    "Edward Boyle": {
        "floorid": "edwardboyle",
        "capacity": 1800,
        "occupancy": 0,
        "available": false
    },
    "Laidlaw": {
        "floorid": "laidlaw",
        "capacity": 640,
        "occupancy": 0,
        "available": false
    }
};

/* the floor currently selected, so the message can be refreshed when data changes */
let activeFloorid = '';

/**
 * Custom control to display occupancy. Leaflet 2.0 controls are plain
 * ES6 classes extending Control, rather than Control.extend({...}).
 */
class OccupancyControl extends Control {
    onAdd( map ) {
        let c = DomUtil.create( 'div', 'hidden' );
        c.setAttribute( 'id', 'occupancyContainer' );
        for ( let lib in floorplans.occupancyData ) {
            DomUtil.create( 'p', 'hidden '+floorplans.occupancyData[lib].floorid+'msg', c );
        }
        return c;
    }

    onRemove( map ) {
        // Nothing to do here
    }
}

/**
 * Adds the control to the map once it's ready, and wires up the floor
 * selecter (built by SelecterControl) to show/hide the occupancy message
 */
document.addEventListener( 'fpmapready', e => {
    new OccupancyControl({ position: 'topleft' }).addTo( floorplans.map );

    updateOccupancy();
    setInterval( updateOccupancy, 60000 );

    let floorselecter = document.getElementById( 'floorselecter' );
    if ( floorselecter ) {
        floorselecter.addEventListener( 'change', function(){
            if ( this.options[this.selectedIndex].value !== '' ) {
                showOccupancyMessage( this.options[this.selectedIndex].value );
            }
        });
    }
});

/**
 * get occupancy data from remote JSON file and update
 * floorplans.occupancyData
 */
export function updateOccupancy() {
    fplog( 'updateOccupancy' );
    return getJSON({
        url: "https://floorplans.library.leeds.ac.uk/capacity.json",
        key: "libraryOccupancy",
        expires: 0.015
    })
    .then(
        data => {
            for ( let lib in floorplans.occupancyData ) {
                let occupancy = data && data.hasOwnProperty( lib ) ? parseInt( data[lib].occupancy ) : NaN;
                let capacity = data && data.hasOwnProperty( lib ) ? parseInt( data[lib].capacity ) : NaN;
                if ( ! isNaN( occupancy ) && ! isNaN( capacity ) ) {
                    fplog( 'Updating occupancy for spaces in '+lib+' to '+occupancy );
                    floorplans.occupancyData[lib].occupancy = occupancy;
                    floorplans.occupancyData[lib].capacity = capacity;
                    floorplans.occupancyData[lib].available = true;
                    let msgObj = document.querySelector('.'+floorplans.occupancyData[lib].floorid+'msg');
                    let occupancyMsg = occupancy < 50? "fewer than 50": occupancy.toLocaleString('en');
                    let capacityMsg = capacity.toLocaleString('en')
                    msgObj.innerHTML = 'There are currently <strong>'+occupancyMsg+'</strong> people in the <strong>'+lib+' library</strong>, which has a seating capacity of approximately <strong>'+capacityMsg+'</strong>';
                } else {
                    fplog("No occupancy data for "+lib);
                    floorplans.occupancyData[lib].available = false;
                }
            }
            showOccupancyMessage( activeFloorid );
        },
        /* hide the control if the data can't be loaded */
        () => {
            for ( let lib in floorplans.occupancyData ) {
                floorplans.occupancyData[lib].available = false;
            }
            showOccupancyMessage( activeFloorid );
        }
    );
}

/**
 * Shows the occupancy message for the library on the given floor - the control
 * is hidden if the floor isn't in one of the libraries, or there is no data
 * @param {String} floorid
 */
export function showOccupancyMessage( floorid ) {
    activeFloorid = floorid || '';
    let c = document.getElementById('occupancyContainer');
    if ( ! c ) {
        return;
    }
    let lib = Object.keys( floorplans.occupancyData ).find( l => activeFloorid.startsWith( floorplans.occupancyData[l].floorid ) );
    if ( ! lib || ! floorplans.occupancyData[lib].available ) {
        c.classList.add('hidden');
        return;
    }
    if ( floorid.match( '(edward|laidlaw)' ) ) {
        c.classList.remove('hidden');
        let activemsg, inactivemsg;
        if ( floorid.match( 'edward' ) ) {
            activemsg = document.querySelector('.edwardboylemsg');
            inactivemsg = document.querySelector('.laidlawmsg');
        } else {
            inactivemsg = document.querySelector('.edwardboylemsg');
            activemsg = document.querySelector('.laidlawmsg');
        }
        inactivemsg.classList.add('hidden');
        activemsg.classList.remove('hidden');
    } else {
        c.classList.add('hidden');
    }
}
