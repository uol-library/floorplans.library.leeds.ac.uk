import { floorplans } from './config.mjs';
import { getFeature, fplog } from './utilities.mjs';
import { DomUtil, DomEvent } from 'leaflet';
/**
 * This file contains all the functions used to create the floor selecter control
 * on the floorplans map
 */

/**
 * This sets up the selecter control and adds it to the controls container element
 */
function setupSelecterControl() {
    var du = new DomUtil();
    var de = new DomEvent();
    /**
     * Library selecter control
     * This contains (initially) a drop-down list of library floorplans
     * When one is selected, additional dropdowns will appear for shelves / subjects and 
     * other locations on the floor, built using buildFeatureSelects()
     */
    floorplans.controlsContainer = du.get( 'floorplan-controls' );

    /* title bar */
    let header = du.create( 'h2', 'floorplans-selecter-header', floorplans.controlsContainer );
    header.textContent = 'Library Floorplans Navigation';
    let fs = du.create( 'fieldset', 'floorplans-selecter', floorplans.controlsContainer );
    let ld = du.create( 'legend', 'floorplans-selecter-legend visuallyhidden', fs );
    ld.textContent = 'Floorplan controls';

    floorplans.controls = du.create( 'div', 'floorplans-selecter-content', fs );
    floorplans.controls.setAttribute( 'id', 'floorplans-selecter-controls' );
    
    /* floor selecter drop-down */
    let floorselecterLabel = du.create( 'label', 'selecter__label', floorplans.controls );
    floorselecterLabel.textContent = "Select a Library / floor";
    floorselecterLabel.setAttribute( 'id', 'floorselecterlabel' );
    floorselecterLabel.setAttribute( 'for', 'floorselecter' );
    let floorselecter = du.create( 'select', 'selecter__select', floorplans.controls  );
    floorselecter.setAttribute( 'id', 'floorselecter' );
    
    /* build the select list to show all available floors */
    let nullopt = du.create( 'option', '', floorselecter );
    nullopt.textContent = "Select a Library / floor";
    floorplans.imagelayers.forEach( lib => {
        let optgrp = du.create( 'optgroup', '', floorselecter );
        optgrp.setAttribute( 'label', lib.title );
        lib.floors.forEach( floor => {
            let flooropt = du.create( 'option', '', optgrp );
            flooropt.textContent = floor.floorname;
            flooropt.setAttribute( 'value', floor.floorid );
        });
    });

    /* areas */
    let areaSelecter = du.create( 'div', 'hidden', floorplans.controls );
    areaSelecter.setAttribute( 'id', 'areaselecter' );
    let areaselecterHeading = du.create( 'h3', '', areaSelecter );
    areaselecterHeading.textContent = 'Study Areas';
    /* area selecter list */
    let areaselecterList = du.create( 'ul', 'selecter__list', areaSelecter );
    areaselecterList.setAttribute( 'id', 'areaselecterlist' );

    /* shelf selecter drop-down - subjects */
    let shelfSelecter = du.create( 'div', 'hidden', floorplans.controls );
    shelfSelecter.setAttribute( 'id', 'shelfselecter' );
    let shelfselecterHeading = du.create( 'h3', '', shelfSelecter );
    shelfselecterHeading.textContent = 'Subjects on this floor';
    /* shelf selecter list - subjects */
    let shelfselecterList = du.create( 'ul', 'selecter__list', shelfSelecter );
    shelfselecterList.setAttribute( 'id', 'shelfselecterlist' );
    
    /* location selecter drop-down - areas of interest */
    let locationSelecter = du.create( 'div', 'hidden', floorplans.controls );
    locationSelecter.setAttribute( 'id', 'locationselecter' );
    let locationselecterHeading = du.create( 'h3', '', locationSelecter );
    locationselecterHeading.textContent = 'Also on this floor';
    /* location selecter list - other features on this floor */
    let locationselecterList = du.create( 'ul', 'selecter__list', locationSelecter );
    locationselecterList.setAttribute( 'id', 'locationselecterlist' );

    /* Listen for changes to floor selecter */
    de.on( floorselecter, 'change', e => {
        if ( this.options[this.selectedIndex].value !== '' ) {
            /* remove all layers from map */
            floorplans.map.eachLayer( function( layer ) {
                floorplans.map.removeLayer( layer );
            });
            /* empty the current lists */
            ['areaselecter', 'shelfselecter', 'locationselecter' ].forEach( s => {
                let listcontainer = du.get( s + 'list' );
                if ( listcontainer && listcontainer.hasChildNodes() ) {
                    du.empty( listcontainer );
                }
                du.addClass( du.get( s ), 'hidden' );
            });
            /* go through data looking for a floor to match the dropdown value */
            floorplans.imagelayers.forEach( lib => {
                lib.floors.forEach( floor => {
                    if ( floor.floorid == this.options[this.selectedIndex].value ) {
                        /* add floor layer */
                        addFloorLayer( floor )
                        .then( ( floorlayer ) => {
                            /* build select controls for shelves and locations */
                            buildFeatureSelects( floor, du, de );
                            sortFeatureSelects( floor );
                            /* add the floor layer to the map and center it */
                            floorlayer.addTo( floorplans.map );
                            floorplans.currentFloor = floor;
                            floorplans.map.fitBounds( floor.imageBounds );
                            floorplans.map.setView( floor.imageBounds.getCenter() );
                            fplog( 'Added layer for floor '+floor.floorname );
                        });
                    }
                });
            });
        }
    });

    /* activate the menu button to allow the selecter to be shuffled off screen */
    var menuButton = du.get( 'menu-close-button' );
    var menuContainer = du.get( 'floorplan-controls' );
    de.on( menuButton, 'click', e => {
        if ( menuButton.classList.contains( 'close' ) ) {
            menuButton.classList.remove( 'close' );
            menuContainer.classList.add( 'closed' );
        } else {
            menuButton.classList.add( 'close' );
            menuContainer.classList.remove( 'closed' );
        }
    });
}

/**
 * This builds lists for features (shelves and locations added in geoJSON layers)
 * which are added to the libraryselecter control
 * @param {Object} floor
 * @param {Object} DomUtil
 * @param {Object} DomEvent
 */
function buildFeatureSelects( floor, du, de ) {
    for ( s in floor.selecters ) {
        /* get the container and the list */
        let listcontainer = du.get( s + 'selecter' );
        let list = du.get( s + 'selecterlist' );

        /**
         * The floor.selecters object is built by addFloorLayer() and contains two
         * properties (shelf and location) which are used to build two lists of
         * buttons in the control
         */
        if ( floor.selecters[s].length ) {
            floor.selecters[s].forEach( o => {
                let itemli = du.create('li', 'item-' + s, list );
                itemli.setAttribute( 'data-sortkey', o.label.toLowerCase().replace( /\W/g, '' ).replace( /(8|13)([1-9])$/, '$10$2' ) );
                let itemClass = s+'button ' + o.class;
                if ( o.icon && o.icon !== '' ) {
                    itemClass += ' icon-' + o.icon;
                }
                let itembutton = du.create('button', itemClass, itemli );
                itembutton.innerText = o.label;
                itembutton.setAttribute( 'data-featureid', o.value );
                /* add event to highlight a feature */
                de.on( itembutton, 'focus mouseover', e => {
                    let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                    layer.fire( 'mouseover', {}, true );
                });
                /* add event to remove highlight */
                de.on( itembutton, 'blur mouseout', e => {
                    let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                    layer.fire( 'mouseout', {}, true );
                });
                if ( o.desc && o.desc !== '' && !o.icon ) {
                    itembutton.title = o.desc;
                    //let desc = du.create('span', 'feature-description', itemli );
                    //desc.innerText = o.desc;
                }
            });
            /* show the selecter */
            listcontainer.classList.remove( 'hidden' );
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
        let list = du.get( s + 'selecterlist' );
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

export { buildFeatureSelects, sortFeatureSelects, setupSelecterControl }