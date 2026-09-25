import { Control, DomUtil } from 'leaflet';
import { getJSON, fplog } from './utilities.mjs';

/**
 * Occupancy control
 * Displays the current occupancy of the library for the floor being viewed.
 * The control listens for the fpfloorloaded event (dispatched on document when
 * a floor becomes the current floor) and is hidden if the floor isn't in one of
 * the libraries in options.libraries, or there is no data for that library.
 *
 * Leaflet 2.0 controls are plain ES6 classes extending Control, so this is
 * added to the map with new OccupancyControl().addTo( map )
 */
export class OccupancyControl extends Control {

    static {
        this.setDefaultOptions({
            position: 'bottomright',
            url: 'https://floorplans.library.leeds.ac.uk/capacity.json',
            /* how often to refresh the data (in milliseconds) */
            interval: 60000,
            /**
             * libraries to show occupancy for - keys match those in the capacity
             * JSON, and floorid is matched against the start of the current floor ID
             */
            libraries: {
                "Edward Boyle": { "floorid": "edwardboyle" },
                "Laidlaw": { "floorid": "laidlaw" }
            }
        });
    }

    onAdd( map ) {
        let container = DomUtil.create( 'div', 'hidden' );
        container.setAttribute( 'id', 'occupancyContainer' );

        /**
         * Set up data container - available is set to true once data has been
         * loaded for a library, so the control is only shown when there is data
         */
        this._data = {};
        for ( let lib in this.options.libraries ) {
            this._data[lib] = {
                floorid: this.options.libraries[lib].floorid,
                occupancy: 0,
                capacity: 0,
                available: false,
                msg: DomUtil.create( 'p', 'hidden', container )
            };
        }

        /* the floor currently selected, so the message can be refreshed when data changes */
        this._floorid = '';

        this._onFloorLoaded = e => this.showMessage( e.detail.floor.floorid );
        document.addEventListener( 'fpfloorloaded', this._onFloorLoaded );

        this.update();
        this._timer = setInterval( () => this.update(), this.options.interval );

        return container;
    }

    onRemove( map ) {
        document.removeEventListener( 'fpfloorloaded', this._onFloorLoaded );
        clearInterval( this._timer );
    }

    /**
     * Gets occupancy data from the remote JSON file and updates the messages
     */
    update() {
        fplog( 'OccupancyControl.update' );
        return getJSON({
            url: this.options.url,
            key: 'libraryOccupancy',
            expires: 0.015
        })
        .then(
            data => {
                for ( let lib in this._data ) {
                    let d = this._data[lib];
                    let occupancy = data && data.hasOwnProperty( lib ) ? parseInt( data[lib].occupancy ) : NaN;
                    let capacity = data && data.hasOwnProperty( lib ) ? parseInt( data[lib].capacity ) : NaN;
                    if ( ! isNaN( occupancy ) && ! isNaN( capacity ) ) {
                        fplog( 'Updating occupancy for spaces in '+lib+' to '+occupancy );
                        d.occupancy = occupancy;
                        d.capacity = capacity;
                        d.available = true;
                        let occupancyMsg = occupancy < 50? "fewer than 50": occupancy.toLocaleString('en');
                        let capacityMsg = capacity.toLocaleString('en');
                        d.msg.innerHTML = 'There are currently <strong>'+occupancyMsg+'</strong> people in the <strong>'+lib+' library</strong>, which has a seating capacity of approximately <strong>'+capacityMsg+'</strong>';
                    } else {
                        fplog("No occupancy data for "+lib);
                        d.available = false;
                    }
                }
                this.showMessage( this._floorid );
            },
            /* hide the control if the data can't be loaded */
            () => {
                for ( let lib in this._data ) {
                    this._data[lib].available = false;
                }
                this.showMessage( this._floorid );
            }
        );
    }

    /**
     * Shows the occupancy message for the library on the given floor - the control
     * is hidden if the floor isn't in one of the libraries, or there is no data
     * @param {String} floorid
     */
    showMessage( floorid ) {
        this._floorid = floorid || '';
        let active = Object.values( this._data ).find( d => this._floorid.startsWith( d.floorid ) );
        for ( let lib in this._data ) {
            this._data[lib].msg.classList.toggle( 'hidden', this._data[lib] !== active );
        }
        this._container.classList.toggle( 'hidden', ! active || ! active.available );
        return this;
    }
}
