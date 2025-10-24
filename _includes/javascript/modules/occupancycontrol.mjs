/**
 * Displays occupancy data for two libraries
 * Set up data container
 */
floorplans.occupancyData = {
    "Edward Boyle": {
        "floorid": "edwardboyle",
        "capacity": 1800,
        "occupancy": 0
    },
    "Laidlaw": {
        "floorid": "laidlaw",
        "capacity": 640,
        "occupancy": 0
    }
};

/**
 * Adds a control to the floorplans to display occupancy
 */
document.addEventListener( 'fpmapready', e => {
    L.Control.Occupancy = L.Control.extend({
        onAdd: function(map) {
            let c = L.DomUtil.create( 'div', 'hidden' );
            c.setAttribute( 'id', 'occupancyContainer' );
            for( lib in floorplans.occupancyData ) {
                L.DomUtil.create( 'p', 'hidden '+floorplans.occupancyData[lib].floorid+'msg', c );
            }
            return c;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    
    L.control.occupancy = function( opts ) {
        return new L.Control.Occupancy( opts );
    }
    
    L.control.occupancy({ position: 'topleft' }).addTo( floorplans.map );

    updateOccupancy();
    setInterval( updateOccupancy, 60000 );
});
/**
 * get occupancy data from remote JSON file and update 
 * spacefinder.occupancyData
 */
function updateOccupancy() {
    fplog( 'updateOccupancy' );
    let options = {
        url: "https://floorplans.library.leeds.ac.uk/capacity.json",
        key: "libraryOccupancy",
        expires: 0.015,
        callback: function( data ) {
			for( lib in floorplans.occupancyData ) {
				if ( data.hasOwnProperty( lib ) ) {
                    fplog( 'Updating occupancy for spaces in '+lib+' to '+data[lib].occupancy );
                    floorplans.occupancyData[lib].occupancy = parseInt(data[lib].occupancy);
                    floorplans.occupancyData[lib].capacity = parseInt(data[lib].capacity);
                    let msgObj = document.querySelector('.'+floorplans.occupancyData[lib].floorid+'msg');
                    let occupancyMsg = floorplans.occupancyData[lib].occupancy < 50? "fewer than 50": floorplans.occupancyData[lib].occupancy.toLocaleString('en');
                    let capacityMsg = floorplans.occupancyData[lib].capacity.toLocaleString('en')
                    msgObj.innerHTML = 'There are currently <strong>'+occupancyMsg+'</strong> people in the <strong>'+lib+' library</strong>, which has a seating capacity of approximately <strong>'+capacityMsg+'</strong>';
				} else {
                    fplog("No occupancy data for "+lib);
                }
			}
        }
    }
    getJSON( options );
}

document.addEventListener( 'DOMContentLoaded', () => {
    L.DomEvent.on( floorselecter, 'change', function(){
        let c = document.getElementById('occupancyContainer');
        if ( this.options[this.selectedIndex].value !== '' ) {
            let floorid = this.options[this.selectedIndex].value;
            showOccupancyMessage( floorid );
        }
    });
});

function showOccupancyMessage( floorid ) {
    let c = document.getElementById('occupancyContainer');
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
