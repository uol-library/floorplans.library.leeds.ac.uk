/**
 * This file contains all the functions used to create the floor selecter control
 * on the floorplans "map"
 */

/**
 * This sets up the selecter control and adds it to the map
 */
function setupFloorSelecterControl() {
    /**
     * Library selecter control
     * This contains (initially) a drop-down list of library floorplans
     * When selected, additional dropdowns will appear for shelves / subjects and 
     * other locations on the floor, built using buildFeatureSelects()
     */
    L.Control.LibraryFloorSelecter = L.Control.extend({
        onAdd: function(map) {
            /* container */
            floorplans.controls = L.DomUtil.create( 'div', 'leaflet-control leaflet-bar leaflet-control-floorplans' );
            
            /* floor selecter drop-down */
            let floorselecterLabel = L.DomUtil.create( 'label', 'selecter__label', floorplans.controls );
            floorselecterLabel.textContent = "Select a Library / floor";
            floorselecterLabel.setAttribute( 'id', 'floorselecterlabel' );
            floorselecterLabel.setAttribute( 'for', 'floorselecter' );
            let floorselecter = L.DomUtil.create( 'select', 'selecter__select', floorselecterLabel  );
            floorselecter.setAttribute( 'id', 'floorselecter' );
            
            /* build the select list to show all available floors */
            let nullopt = L.DomUtil.create( 'option', '', floorselecter );
            nullopt.textContent = "Select a Library / floor";
            floorplans.imagelayers.forEach( lib => {
                let optgrp = L.DomUtil.create( 'optgroup', '', floorselecter );
                optgrp.setAttribute( 'label', lib.title );
                lib.floors.forEach( floor => {
                    let flooropt = L.DomUtil.create( 'option', '', optgrp );
                    flooropt.textContent = floor.floorname;
                    flooropt.setAttribute( 'value', floor.floorid );
                });
            });

            /* Listen for changes to floor selecter */
            L.DomEvent.on( floorselecter, 'change', function(){
                if ( this.options[this.selectedIndex].value !== '' ) {
                    /* remove all layers from map */
                    floorplans.map.eachLayer( function( layer ) {
                        floorplans.map.removeLayer( layer );
                    });
                    /* go through data looking for a floor to match the dropdown value */
                    floorplans.imagelayers.forEach( lib => {
                        lib.floors.forEach( floor => {
                            if ( floor.floorid == this.options[this.selectedIndex].value ) {
                                /* add floor layer */
                                addFloorLayerToEdit( floor )
                                .then( ( floorlayer ) => {
                                    floorlayer.addTo( floorplans.map );
                                    floorplans.activelayer = floorlayer;
                                    floorplans.map.pm.setGlobalOptions( { layerGroup: floorlayer } );
                                    splog( 'Added layer for floor '+floor.floorname , 'refactor.js' );
                                });
                            }
                        });
                    });
                }
            });
            return floorplans.controls;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });

    /* factory */
    L.control.libraryfloorselecter = function(opts) {
        return new L.Control.LibraryFloorSelecter(opts);
    }

    /* instantiate the floor selecter control */
    L.control.libraryfloorselecter({ position: 'topleft' }).addTo( floorplans.map );
}

