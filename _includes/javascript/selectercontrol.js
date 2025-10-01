/**
 * This file contains all the functions used to create the floor selecter control
 * on the floorplans map
 */

/**
 * This sets up the selecter control and adds it to the controls container element
 */
function setupSelecterControl() {
    /**
     * Library selecter control
     * This contains (initially) a drop-down list of library floorplans
     * When one is selected, additional dropdowns will appear for shelves / subjects and 
     * other locations on the floor, built using buildFeatureSelects()
     */
    floorplans.controlsContainer = L.DomUtil.get( 'floorplan-controls' );

    /* title bar */
    let header = L.DomUtil.create( 'h2', 'floorplans-selecter-header', floorplans.controlsContainer );
    header.textContent = 'Library Floorplans Navigation';
    let fs = L.DomUtil.create( 'fieldset', 'floorplans-selecter', floorplans.controlsContainer );
    let ld = L.DomUtil.create( 'legend', 'floorplans-selecter-legend visuallyhidden', fs );
    ld.textContent = 'Floorplan controls';

    floorplans.controls = L.DomUtil.create( 'div', 'floorplans-selecter-content', fs );
    floorplans.controls.setAttribute( 'id', 'floorplans-selecter-controls' );
    
    /* floor selecter drop-down */
    let floorselecterLabel = L.DomUtil.create( 'label', 'selecter__label', floorplans.controls );
    floorselecterLabel.textContent = "Select a Library / floor";
    floorselecterLabel.setAttribute( 'id', 'floorselecterlabel' );
    floorselecterLabel.setAttribute( 'for', 'floorselecter' );
    let floorselecter = L.DomUtil.create( 'select', 'selecter__select', floorplans.controls  );
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

    /* areas */
    let areaSelecter = L.DomUtil.create( 'div', 'hidden', floorplans.controls );
    areaSelecter.setAttribute( 'id', 'areaselecter' );
    let areaselecterHeading = L.DomUtil.create( 'h3', '', areaSelecter );
    areaselecterHeading.textContent = 'Study Areas';
    /* area selecter list */
    let areaselecterList = L.DomUtil.create( 'ul', 'selecter__list', areaSelecter );
    areaselecterList.setAttribute( 'id', 'areaselecterlist' );

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
            /* empty the current lists */
            ['areaselecter', 'shelfselecter', 'locationselecter' ].forEach( s => {
                L.DomUtil.empty( L.DomUtil.get( s + 'list' ) );
                L.DomUtil.addClass( L.DomUtil.get( s ), 'hidden' );
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
    var menuButton = document.getElementById( 'menu-close-button' );
    var menuContainer = document.getElementById( 'floorplan-controls' );
    menuButton.addEventListener( 'click', e => {
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
 */
function buildFeatureSelects( floor ) {
    for ( s in floor.selecters ) {
        /* get the container and the list */
        let listcontainer = L.DomUtil.get( s + 'selecter' );
        let list = L.DomUtil.get( s + 'selecterlist' );

        /**
         * The floor.selecters object is built by addFloorLayer() and contains two
         * properties (shelf and location) which are used to build two lists of
         * buttons in the control
         */
        if ( floor.selecters[s].length ) {
            floor.selecters[s].forEach( o => {
                let itemli = L.DomUtil.create('li', 'item-' + s, list );
                itemli.setAttribute( 'data-sortkey', o.label.toLowerCase().replace( /\W/g, '' ).replace( /(8|13)([1-9])$/, '$10$2' ) );
                let itemClass = s+'button ' + o.class;
                if ( o.icon && o.icon !== '' ) {
                    itemClass += ' icon-' + o.icon;
                }
                let itembutton = L.DomUtil.create('button', itemClass, itemli );
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
                if ( o.desc && o.desc !== '' && !o.icon ) {
                    itembutton.title = o.desc;
                    //let desc = L.DomUtil.create('span', 'feature-description', itemli );
                    //desc.innerText = o.desc;
                }
            });
            /* show the selecter */
            L.DomUtil.removeClass( listcontainer, 'hidden' );
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
 * This selects a feature by firing the mouseover event on the feature
 * layer. It then highlights the feature in the selecter control by 
 * focussing it.
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
