/**
 * Creates text for the popups
 */
function buildFeaturePopup( feature ) {
    let popupText = '<strong>' + feature.properties.name + '</strong>';
    if ( feature.properties.desc && feature.properties.desc !== '' ) {
        popupText += '<br>' + feature.properties.desc;
    }
    return popupText;
}

/**
 * Selects a floor from the dropdown list
 * @param {String} floorid
 */
function selectFloor( floorid ) {
    let sel = document.getElementById( 'floorselecter' );
    if ( sel ) {
        for (var i = 0; i < sel.options.length; i++) {
            if ( sel.options[i].value === floorid ) {
                sel.options[i].selected = true;
            }
        }
    }
}

/**
 * Selects a feature on the floor from the list of features
 *
 * @uses selectFeature()
 * @param {Object} floor - used to access the lists of features
 * @param {string} shelfName - the Label for the given feature
 */
function selectShelf( floor, shelfName ) {
    floor.selecters.shelf.forEach( s => {
        if ( s.label.match( shelfName ) ) {
            selectFeature( s.value );
        }
    });
}

/**
 * This takes the ID of a feature in a geoJSON layer
 * and returns the layer object which contains the feature
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

/**
 * Highlights a feature on the plan
 * @param {Event} e
 */
function highlightFeature( e ) {
    resetFeatures();
    let layer = e.target;
    if ( layer.id ) {
        let fb = document.querySelector('button[data-featureid="'+layer.id+'"]');
        if ( fb ) {
            fb.focus();
        }
        if ( layer.id.startsWith('area') ) {
            floorplans.map.closePopup();
            layer.openTooltip();
            layer.setStyle({ fillOpacity: 0.4, opacity: 1 } );
            return;
        } else {
            layer.setStyle({ fillOpacity: 0.75, opacity: 1 } );
        }
    }
    // GeoJSON multiple polygons
    if ( layer.feature && layer.feature.geometry && layer.feature.geometry.coordinates && layer.feature.geometry.coordinates.length > 1 ) {
        // not sure how to handle this!
        if ( e.latlng ) {
            layer.openPopup( e.latlng );
        } else {
            layer.openPopup();
        }
        // layer.openPopup( polylabel( layer.feature.geometry.coordinates ) );
    } else {
        layer.openPopup();
    }
}

/**
 * Reset the highlight for all features on the current floor
 *
 */
function resetFeatures() {
    if ( floorplans.currentFloor && floorplans.currentFloor.features ) {
        floorplans.currentFloor.features.eachLayer( function( layer ) {
            if ( layer.id ) {
                if ( layer.id.startsWith('area') ) {
                    layer.setStyle({ fillOpacity: 0.2, opacity: 0 } );
                } else {
                    layer.setStyle({ fillOpacity: 0.5, opacity: 0 } );
                }
            }
        });
    }
}

/**
 * Get an SVG icon by name
 * @param {String} icon
 * @returns SVG Element or false if not found
 */
function getSVGIcon(icon) {
    if ( floorplans.icons.hasOwnProperty(icon) ) {
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.setAttribute('viewBox', floorplans.icons[icon].viewBox);
        svgElement.innerHTML = floorplans.icons[icon].path;
        return svgElement;
    }
    return false;
}

/**
 * Checks to see if localStorage is available
 * 
 * @param {string} type (localStorage or sessionStorage)
 * @returns {boolean}
 */
 function storageAvailable( type ) {
    if ( ! canUseLocalStorage() ) {
        return false;
    }
    var storage;
    try {
        storage = window[ type ];
        var x = '__storage_test__';
        storage.setItem( x, x );
        storage.removeItem( x );
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            ( storage && storage.length !== 0 );
    }
}

/**
 * Sets a value in localStorage but adds expiry date
 * 
 * @param {string} key localStorage key
 * @param {string} value to set
 * @param {int} ttl Time to live (in hours)
 */
function setWithExpiry( key, value, ttl ) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + ( ttl * 60 * 60 * 1000 ),
    }
    localStorage.setItem( key, JSON.stringify( item ) )
}

/**
 * Gets a value in localStorage but checks expiry date
 * first. If expired, localStorage key is removed and
 * null returned.
 * 
 * @param {string} key localStorage key
 */
function getWithExpiry( key ) {
    const itemStr = localStorage.getItem( key )
    if ( ! itemStr ) {
        return null;
    }
    const item = JSON.parse( itemStr )
    const now = new Date()
    if ( now.getTime() > item.expiry ) {
        localStorage.removeItem( key )
        return null
    }
    return item.value;
}

/**
 * Gets a JSON data file from a remote URL. Utilises localstorage
 * to cache the results.
 * @param {Object} options Information about the JSON file
 * @param {String} options.key Unique key used to store the data in localstorage (required)
 * @param {String} options.url URL of the JSON file (required)
 * @param {Integer} options.expiry How long to cache the results (in hours) default: 24
 * @param {Function} options.callback callback function with one parameter (JSON parsed response)
 */
 function getJSON( options ) {
    if ( ! options.hasOwnProperty( 'key' ) || ! options.hasOwnProperty( 'url' ) ) {
        return;
    }
    if ( ! options.hasOwnProperty( 'expires' ) ) {
        options.expires = 24;
    }
    if ( storageAvailable( 'localStorage' ) && getWithExpiry( options.key ) ) {
        fplog( "getting data '"+options.key+"' from local storage" );
        if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
            options.callback( JSON.parse( getWithExpiry( options.key ) ) );
        }
    } else {
        fplog( "getting data '"+options.key+"' from "+options.url );
        var oReq = new XMLHttpRequest();
        oReq.addEventListener( 'load', function(){
            if ( storageAvailable( 'localStorage' ) ) {
                var expires = new Date().getTime() + ( options.expires * 60 * 60 * 1000 );
                fplog( "storing data '" + options.key + "' in localstorage - expires " + expires );
                setWithExpiry( options.key, this.responseText, options.expires );
            }
            if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
                options.callback( JSON.parse( this.responseText ) );
            }
        });
        oReq.open("GET", options.url);
        oReq.send();
    }
}

/**
 * Logs messages to console if debug flag is set
 * @param {string} message
 */
function fplog( message ) {
    if ( floorplans.conf.debug ) {
        let now = new Date();
        console.log( now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0') + '.' + now.getMilliseconds().toString().padStart(3, '0') + ' ' + message );
    }
}
