import { Control, DomUtil, DomEvent } from 'leaflet';
import { floorplans } from './config.mjs';
import { loadFloor } from './core.mjs';
import { getFeature, fplog } from './utilities.mjs';

/**
 * This file contains the floor selecter control and the functions used to
 * populate it on the floorplans map
 */

/**
 * Library selecter control
 * This contains (initially) a drop-down list of library floorplans
 * When one is selected, additional lists will appear for areas / subjects and
 * other services on the floor, built using buildLists()
 *
 * Leaflet 2.0 controls are plain ES6 classes extending Control, so this is
 * added to the map with new SelecterControl().addTo( map )
 */
export class SelecterControl extends Control {

    static {
        this.setDefaultOptions({
            position: 'topleft',
            title: 'Library Floorplans'
        });
    }

    onAdd( map ) {
        let container = DomUtil.create( 'div', 'floorplans-selecter-control' );
        container.setAttribute( 'id', 'floorplan-controls' );

        /* stop clicks and scrolling in the control from moving the map */
        DomEvent.disableClickPropagation( container );
        DomEvent.disableScrollPropagation( container );

        /* menu button to allow the selecter to be shuffled off screen */
        let menubar = DomUtil.create( 'div', 'menubar', container );
        this._menuButton = DomUtil.create( 'button', 'btn-menu close', menubar );
        this._menuButton.setAttribute( 'id', 'menu-close-button' );
        this._menuButton.setAttribute( 'type', 'button' );
        this._menuButton.setAttribute( 'aria-controls', 'floorplans-selecter-controls' );
        this._menuButton.setAttribute( 'aria-expanded', 'true' );
        DomUtil.create( 'span', 'icon', this._menuButton );
        this._menuButtonLabel = DomUtil.create( 'span', 'visuallyhidden', this._menuButton );
        this._menuButtonLabel.textContent = 'Close';
        DomEvent.on( this._menuButton, 'click', this.toggle, this );

        /* title bar */
        let header = DomUtil.create( 'h2', 'floorplans-selecter-header', container );
        header.textContent = this.options.title;
        let fs = DomUtil.create( 'fieldset', 'floorplans-selecter', container );
        let ld = DomUtil.create( 'legend', 'floorplans-selecter-legend visuallyhidden', fs );
        ld.textContent = 'Floorplan controls';

        let controls = DomUtil.create( 'div', 'floorplans-selecter-content', fs );
        controls.setAttribute( 'id', 'floorplans-selecter-controls' );

        /* floor selecter drop-down */
        let floorselecterLabel = DomUtil.create( 'label', 'selecter__label', controls );
        floorselecterLabel.textContent = "Select a Library / floor";
        floorselecterLabel.setAttribute( 'id', 'floorselecterlabel' );
        floorselecterLabel.setAttribute( 'for', 'floorselecter' );
        this._floorselecter = DomUtil.create( 'select', 'selecter__select', controls );
        this._floorselecter.setAttribute( 'id', 'floorselecter' );

        /* build the select list to show all available floors */
        let nullopt = DomUtil.create( 'option', '', this._floorselecter );
        nullopt.textContent = "Select a Library / floor";
        nullopt.setAttribute( 'value', '' );
        floorplans.libraries.forEach( lib => {
            let optgrp = DomUtil.create( 'optgroup', '', this._floorselecter );
            optgrp.setAttribute( 'label', lib.title );
            lib.floors.forEach( floor => {
                let flooropt = DomUtil.create( 'option', '', optgrp );
                flooropt.textContent = floor.floorname;
                flooropt.setAttribute( 'value', floor.floorid );
            });
        });
        DomEvent.on( this._floorselecter, 'change', this._onFloorChange, this );

        /**
         * areas, shelves (subjects) and services (other features on this floor)
         * subjects and services act as an accordion - only one is open at a time
         */
        this._toggleables = [];
        this._createList( controls, 'area', 'Study Areas' );
        this._createList( controls, 'shelf', 'Subjects on this floor', true );
        this._createList( controls, 'service', 'Services on this floor', true );
        this._expandList( 'shelf' );

        return container;
    }

    onRemove( map ) {
        DomEvent.off( this._menuButton, 'click', this.toggle, this );
        DomEvent.off( this._floorselecter, 'change', this._onFloorChange, this );
    }

    /**
     * Whether the selecter panel is open (on screen)
     * @returns {Boolean}
     */
    isOpen() {
        return ! this._container.classList.contains( 'closed' );
    }

    /**
     * Padding to use when fitting bounds to the map, so the floor plan isn't
     * hidden behind the selecter panel
     * @returns {Array} [x, y] padding for the top left of the map
     */
    getPadding() {
        return [ this.isOpen() ? this._container.offsetWidth : 0, 0 ];
    }

    /**
     * Pans the map by half the width of the panel, so the plan stays centred in
     * the visible area of the map when the panel is opened or closed
     * @param {Number} direction - 1 to move the plan left, -1 to move it right
     */
    _panForPanel( direction ) {
        this._map.panBy( [ direction * this._container.offsetWidth / 2, 0 ], { duration: .3 } );
    }

    /**
     * Opens the selecter panel
     */
    open() {
        if ( ! this.isOpen() ) {
            this._panForPanel( -1 );
        }
        this._container.classList.remove( 'closed' );
        this._menuButton.classList.add( 'close' );
        this._menuButton.setAttribute( 'aria-expanded', 'true' );
        this._menuButtonLabel.textContent = 'Close';
        return this;
    }

    /**
     * Shuffles the selecter panel off screen
     */
    close() {
        if ( this.isOpen() ) {
            this._panForPanel( 1 );
        }
        this._container.classList.add( 'closed' );
        this._menuButton.classList.remove( 'close' );
        this._menuButton.setAttribute( 'aria-expanded', 'false' );
        this._menuButtonLabel.textContent = 'Open';
        return this;
    }

    toggle() {
        return this.isOpen() ? this.close() : this.open();
    }

    /**
     * Creates a (hidden) heading and list for one of the feature selecters
     * @param {HTMLElement} parent
     * @param {String} type - area, shelf or service
     * @param {String} heading
     * @param {Boolean} toggleable - whether the heading is a button which shows / hides the list
     */
    _createList( parent, type, heading, toggleable = false ) {
        let selecter = DomUtil.create( 'div', 'selecter__group hidden', parent );
        selecter.setAttribute( 'id', type + 'selecter' );
        let selecterHeading = DomUtil.create( 'h3', '', selecter );
        if ( toggleable ) {
            selecter.classList.add( 'selecter__group--toggleable' );
            /**
             * The collapsed state is kept on the container (rather than using the
             * hidden class on the list) so it persists when buildLists()
             * rebuilds the list for a new floor
             */
            let toggleButton = DomUtil.create( 'button', 'selecter__toggle', selecterHeading );
            toggleButton.setAttribute( 'type', 'button' );
            toggleButton.setAttribute( 'aria-controls', type + 'selecterlist' );
            toggleButton.textContent = heading;
            this._toggleables.push( { type, selecter, toggleButton } );
            DomEvent.on( toggleButton, 'click', () => {
                if ( selecter.classList.contains( 'collapsed' ) ) {
                    this._expandList( type );
                } else {
                    this._collapseList( selecter, toggleButton );
                }
            });
        } else {
            selecterHeading.textContent = heading;
        }
        let selecterList = DomUtil.create( 'ul', 'selecter__list', selecter );
        selecterList.setAttribute( 'id', type + 'selecterlist' );
    }

    /**
     * Expands one of the toggleable lists and collapses the others
     * @param {String} type - shelf or service
     */
    _expandList( type ) {
        this._toggleables.forEach( t => {
            if ( t.type === type ) {
                t.selecter.classList.remove( 'collapsed' );
                t.toggleButton.setAttribute( 'aria-expanded', 'true' );
            } else {
                this._collapseList( t.selecter, t.toggleButton );
            }
        });
    }

    /**
     * Collapses one of the toggleable lists
     * @param {HTMLElement} selecter - the list container
     * @param {HTMLElement} toggleButton
     */
    _collapseList( selecter, toggleButton ) {
        selecter.classList.add( 'collapsed' );
        toggleButton.setAttribute( 'aria-expanded', 'false' );
    }

    /**
     * Sets the accordion state once the lists have been built for a floor. The
     * subjects list is expanded if there are shelves on the floor, otherwise the
     * services list is expanded
     */
    updateToggleables() {
        let shelves = this._toggleables.find( t => t.type === 'shelf' );
        let hasShelves = shelves && ! shelves.selecter.classList.contains( 'hidden' );
        this._expandList( hasShelves ? 'shelf' : 'service' );
    }

    /**
     * Selects a floor in the floor selecter drop-down (without triggering a change)
     * @param {String} floorid
     */
    selectFloor( floorid ) {
        let opt = Array.from( this._floorselecter.options ).find( o => o.value === floorid );
        if ( opt ) {
            opt.selected = true;
        }
        return this;
    }

    /**
     * Builds and sorts the area, shelf and service lists for a floor. Lists with
     * no features on the floor are hidden. The floor.selecters object used to
     * build the lists is populated by addFloorLayer(), so this should be called
     * once the floor layer has loaded
     * @param {String} floorid
     */
    buildLists( floorid ) {
        let floor = floorplans.libraries.flatMap( lib => lib.floors ).find( f => f.floorid === floorid );
        if ( ! floor ) {
            fplog( 'Cannot build lists - floor not found: ' + floorid );
            return this;
        }
        /**
         * loop through all list types rather than the keys of floor.selecters, as that
         * only contains the types present on this floor, and lists left over from the
         * previous floor need to be hidden
         */
        [ 'area', 'shelf', 'service' ].forEach( type => {
            this._buildList( floor, type );
            this._sortList( type );
        });
        /* expand subjects if there are any on this floor, otherwise services */
        this.updateToggleables();
        return this;
    }

    /**
     * Builds one of the feature lists (shelves and services added in geoJSON layers)
     * for a floor
     * @param {Object} floor
     * @param {String} type - area, shelf or service
     */
    _buildList( floor, type ) {
        /* get the container and the list */
        let listcontainer = document.getElementById( type + 'selecter' );
        let list = document.getElementById( type + 'selecterlist' );
        /* hide them while we monkey around with the list items */
        listcontainer.classList.add( 'hidden' );
        list.classList.add( 'hidden' );
        /* empty the list */
        if ( list.hasChildNodes() ) {
            list.innerHTML = '';
        }

        let items = floor.selecters[type];
        if ( ! items || ! items.length ) {
            return;
        }
        items.forEach( o => {
            let itemli = DomUtil.create('li', 'item-' + type, list );
            itemli.setAttribute( 'data-sortkey', o.label.toLowerCase().replace( /\W/g, '' ).replace( /(8|13)([1-9])$/, '$10$2' ) );
            let itemClass = type + 'button ' + o.class;
            if ( o.icon && o.icon !== '' ) {
                itemClass += ' icon-' + o.icon;
            }
            let itembutton = DomUtil.create('button', itemClass, itemli );
            itembutton.innerText = o.label;
            itembutton.setAttribute( 'data-featureid', o.value );
            /* add event to highlight a feature */
            DomEvent.on( itembutton, 'focus pointerover', function(e) {
                let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                layer.fire( 'pointerover', {}, true );
            });
            /* add event to remove highlight */
            DomEvent.on( itembutton, 'blur pointerout', function(e) {
                let layer = getFeature( e.target.getAttribute( 'data-featureid' ) );
                layer.fire( 'pointerout', {}, true );
            });
            if ( o.desc && o.desc !== '' && !o.icon ) {
                itembutton.title = o.desc;
            }
        });
        fplog( 'Built selecter for ' + type + ' with ' + items.length + ' items' );
        /* show the selecter */
        listcontainer.classList.remove( 'hidden' );
        list.classList.remove( 'hidden' );
    }

    /**
     * Sorts the items in one of the feature lists according to their
     * data-sortkey attribute
     * @param {String} type - area, shelf or service
     */
    _sortList( type ) {
        let list = document.getElementById( type + 'selecterlist' );
        Array.from( list.querySelectorAll( 'li' ) )
            .sort( ( a, b ) => a.getAttribute( 'data-sortkey' ).localeCompare( b.getAttribute( 'data-sortkey' ) ) )
            .forEach( li => list.appendChild( li ) );
    }

    /**
     * Listens for changes to floor selecter and loads the selected floor
     */
    _onFloorChange() {
        let floorid = this._floorselecter.value;
        if ( floorid === '' ) {
            return;
        }
        loadFloor( floorid, null, true )
        .catch( err => fplog( 'Error loading floor ' + floorid + ': ' + err.message ) );
    }
}
