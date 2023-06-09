/**
 * This file contains all the functions used to create the floor selecter control
 * on the floorplans "map"
 */

/**
 * This sets up the selecter control and adds it to the map
 */
function setupSelecterControl() {
    /**
     * Library selecter control
     * This contains (initially) a drop-down list of library floorplans
     * When selected, additional dropdowns will appear for shelves / subjects and 
     * other locations on the floor, built using buildFeatureSelects()
     */
    L.Control.LibrarySelecter = L.Control.extend({
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

            /* shelf selecter drop-down - subjects */
            let shelfSelecter = L.DomUtil.create( 'div', 'hidden', floorplans.controls );
            shelfSelecter.setAttribute( 'id', 'shelfselecter' );
            let shelfselecterHeading = L.DomUtil.create( 'h3', '', shelfSelecter );
            shelfselecterHeading.textContent = 'Subjects on this floor';
            /* shelf selecter list - subjects */
            let shelfselecterList = L.DomUtil.create( 'ul', 'selecter__list', shelfSelecter );
            shelfselecterList.setAttribute( 'id', 'shelfselecterlist' );
            
            /* location selecter drop-down - areas of interest */
            let locationSelecter = L.DomUtil.create( 'div', 'hidden', floorplans.controls );
            locationSelecter.setAttribute( 'id', 'locationselecter' );
            let locationselecterHeading = L.DomUtil.create( 'h3', '', locationSelecter );
            locationselecterHeading.textContent = 'Also on this floor';
            /* location selecter list - other features on this floor */
            let locationselecterList = L.DomUtil.create( 'ul', 'selecter__list', locationSelecter );
            locationselecterList.setAttribute( 'id', 'locationselecterlist' );

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
                                addFloorLayer( floor )
                                .then( ( floorlayer ) => {
                                    /* build select controls for shelves and locations */
                                    buildFeatureSelects( floor );
                                    sortFeatureSelects( floor );
                                    floorlayer.addTo( floorplans.map );
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
    L.control.libraryselecter = function(opts) {
        return new L.Control.LibrarySelecter(opts);
    }

    /* instantiate the floor selecter control */
    L.control.libraryselecter({ position: 'topleft' }).addTo( floorplans.map );
}

/**
 * This builds lists for features (shelves and locations added in geoJSON layers)
 * which are added to the libraryselecter control
 * @param {Object} floor 
 */
function buildFeatureSelects( floor ) {
    for ( s in floor.selecters ) {
        /* get the container and the list */
        let listcontainer = L.DomUtil.get( s + 'selecter' );
        let list = L.DomUtil.get( s + 'selecterlist' );
        /* empty the list */
        L.DomUtil.empty( list );

        /**
         * The floor.selecters object is built by addFloorLayer() and contains two
         * properties (shelf and location) which are used to build two lists of
         * buttons in the control
         */
        if ( floor.selecters[s].length ) {
            floor.selecters[s].forEach( o => {
                let itemli = L.DomUtil.create('li', o.class + ' item-' + s, list );
                itemli.setAttribute( 'data-sortkey', o.label.toLowerCase().replace( /\W/g, '' ) );
                let itembutton = L.DomUtil.create('button', 'shelfbutton', itemli );
                itembutton.innerText = o.label;
                itembutton.setAttribute( 'data-featureid', o.value );
                /* add event to highlight a feature */
                L.DomEvent.on( itembutton, 'focus mouseover', function(e) {
                    let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                    layer.fire( 'mouseover', {}, true );
                });
                /* add event to remove highlight */
                L.DomEvent.on( itembutton, 'blur mouseout', function(e) {
                    let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                    layer.fire( 'mouseout', {}, true );
                });
            });
            /* show the selecter */
            L.DomUtil.removeClass( listcontainer, 'hidden' );
        } else {
            /* hide the (empty) selecter */
            L.DomUtil.addClass( listcontainer, 'hidden' );
        }
    }
}

/**
 * This sorts the features in a floor's selecters according
 * to the data-sortkey attribute
 * @param {Object} floor 
 */
function sortFeatureSelects( floor ) {
    for ( s in floor.selecters ) {
        let list = L.DomUtil.get( s + 'selecterlist' );
        let sortkeys = [];
        list.querySelectorAll('li').forEach( el => {
            sortkeys.push( el.getAttribute('data-sortkey'));
        });
        sortkeys.sort();
        sortkeys.forEach( key => {
            let li = list.querySelector('[data-sortkey="'+key+'"]');
            list.appendChild(li);
        });
    }
}
/**
 * This takes the ID of a feature in a geoJSON layer
 * and returns the layer object which cointains the feature
 * @param {String} featureid 
 * @returns {Object} layer
 */
function getFeature( featureid ) {
    let feature = false;
    floorplans.map.eachLayer( layer => {
        if ( layer.id && layer.id === featureid ) {
            feature = layer;
        }
    });
    return feature;
}
/**
 * 
 */
function selectFeature( featureid ) {
    let layer = getFeature( featureid );
    if ( layer !== false ) {
        layer.fire( 'mouseover', {}, true );
        let fb = document.querySelector('button[data-featureid="'+featureid+'"]');
        if ( fb ) {
            fb.focus();
        }
    }
}
function initAccordions() {
    /* init accordions */
    const accordions = document.querySelectorAll( '.accordion' );
    accordions.forEach( accordionEl => {
        new Accordion( accordionEl );
    });
}