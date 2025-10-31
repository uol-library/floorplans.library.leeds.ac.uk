import { floorplans } from './config.mjs';
document.addEventListener( "DOMContentLoaded", e => {
	checkGeoAvailable();
});

/**
 * Tests for availability of geolocation on client. If available,
 * adds buttons to activate it and adds listeners to buttons.
 */
function checkGeoAvailable() {
    if ( 'geolocation' in navigator ) {
        floorplans.personRadius = 5;
        floorplans.personMarker = L.marker([0,0]).bindPopup('No geolocation data available');
        floorplans.personCircle = L.circle([0,0], floorplans.personRadius);
        floorplans.followingPerson = false;
        floorplans.personLoc = floorplans.map.getCenter();
        floorplans.currentLoc = floorplans.map.getCenter();

        /* make button for map to let user activate geolocation */
        L.Control.geoControl = L.Control.extend({
            onAdd: function(map) {
                var container = L.DomUtil.create('div', 'leaflet-control-geolocation');
                const locationButton = document.createElement( 'button' );
                locationButton.innerHTML = '';
                locationButton.classList.add( 'geo-button' );
                locationButton.classList.add( 'icon-my-location' );
                locationButton.setAttribute( 'aria-label', 'Use my location' );
                locationButton.setAttribute( 'title', 'Use my location' );
//                locationButton.innerHTML = '<svg fill="#333" version="1.1" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 446.381 446.381"><circle cx="223.19" cy="223.19" r="50.998"/><path d="M441.381,193.19h-39.666c-12.701-75.828-72.697-135.823-148.525-148.524V5c0-2.761-2.238-5-5-5h-50c-2.761,0-5,2.239-5,5 v39.666C117.362,57.367,57.367,117.362,44.666,193.19H5c-2.761,0-5,2.239-5,5v50c0,2.762,2.239,5,5,5h39.666	c12.701,75.828,72.696,135.824,148.524,148.525v39.666c0,2.76,2.239,5,5,5h50c2.762,0,5-2.24,5-5v-39.666 c75.828-12.701,135.824-72.697,148.525-148.525h39.666c2.76,0,5-2.238,5-5v-50C446.381,195.429,444.143,193.19,441.381,193.19z M223.19,354.214c-72.247,0-131.024-58.776-131.024-131.024c0-72.247,58.777-131.024,131.024-131.024 c72.248,0,131.025,58.777,131.025,131.024C354.215,295.438,295.438,354.214,223.19,354.214z"/></svg>';
                L.DomEvent.on( locationButton, 'click', L.DomEvent.stop ).on( locationButton, 'click', e => {
                    if ( ! geolocationEnabled() ) {
                        return;
                    }
                    if ( geolocationActive() ) {
                        /* disable geolocation */
                        floorplans.map.stopLocate();
                        activateGeolocation( false );
                        if ( ! floorplans.recentreControl ) {
                            floorplans.recentreControl = L.control.recentreControl( { position: 'bottomleft' } ).addTo( floorplans.map );
                        }
                    } else {
                        /* get the current position */
                        floorplans.map.locate({
                            setView: true,
                            maxZoom: 18,
                            watch: true,
                            enableHighAccuracy: true
                        });
                        activateGeolocation( true );
                    }
                });
                container.appendChild( locationButton );
                return container;
            },
            onRemove: function(map) {}
        });
        L.control.geoControl = function(opts) {
            return new L.Control.geoControl(opts);
        }
        L.control.geoControl( { position: 'topright' } ).addTo( floorplans.map );

        /**
         * Create a button to recentre the map when geolocation is active and the user
         * drags the map off centre (the map should be centred on the user position)
         */
        L.Control.RecentreControl = L.Control.extend({
            onAdd: function(map) {
                var container = L.DomUtil.create( 'div', 'leaflet-control-recentre' );
                this._recentreButton = L.DomUtil.create( 'button', 'maprecentre-button icon-direction', container );
                this._recentreButton.innerHTML = 'Recentre';
                let btntitle = geolocationActive() ? 'Recentre the map on my location': 'Recentre the map';
                this._recentreButton.setAttribute( 'aria-label', btntitle );
                this._recentreButton.setAttribute( 'title', btntitle );
                L.DomEvent.on( this._recentreButton, 'mousedown dblclick', L.DomEvent.stopPropagation )
                    .on( this._recentreButton, 'click', L.DomEvent.stop )
                    .on( this._recentreButton, 'click', this._recentreMap, this );
                return container;
            },
            onRemove: function( map ) {
                L.DomEvent.off( this._recentreButton, 'click mousedown dblclick' );
            },
            _recentreMap: function() {
                let newCenter = geolocationActive() ? floorplans.personLoc: floorplans.currentLoc;
                floorplans.map.panTo( newCenter );
                floorplans.recentreControl = null;
                this.remove();
            }
        });

        /* constructor */
        L.control.recentreControl = function( opts ) {
            return new L.Control.RecentreControl( opts );
        }

        /* add recentre button when map is moved */
        floorplans.map.on( 'movestart', event => {
            if ( geolocationActive() && ! floorplans.recentreControl ) {
                floorplans.recentreControl = L.control.recentreControl( { position: 'bottomleft' } ).addTo( floorplans.map );
            }
        });

        floorplans.map.on( 'locationfound', onLocationFound);
        floorplans.map.on( 'locationerror', onLocationError);

    } else {
        activateGeolocation( false );
        toggleGeolocation( false );
    }
}

/**
 * Test to see if geolocation services are enabled.
 * @returns {boolean}
 */
function geolocationEnabled() {
    const btn = document.querySelector( '.geo-button' );
    if ( btn !== null ) {
        return btn.disabled == false;
    }
    return false;
}

/**
 * Test to see if geolocation services are active
 * @returns {boolean}
 */
function geolocationActive() {
    return ( document.querySelector( '.geo-button.active' ) !== null ? true: false );
}

/**
 * Callback for the locationfound event of the map when the locate() method is
 * called - also called repeatedly if locate() has the watch option set.
 * @param {Evented} e 
 */
function onLocationFound(e) {
    floorplans.personLoc = e.latlng;
    floorplans.personMarker.setLatLng( e.latlng );
    floorplans.personCircle.setLatLng( e.latlng );
    let pMsg = 'Your position:<br>  lat: '+e.latlng.lat+'<br>  lng: '+e.latlng.lng+'<br>';
    if ( e.accuracy ) {
        radius = Math.round( e.accuracy / 2 );
        floorplans.personCircle.setRadius( ( e.accuracy / 2 ) );
        pMsg += '(accurate to '+e.accuracy+' metres)<br>';
    }
    if ( e.altitude ) {
        pMsg +=  'Your altitude: '+Math.round( e.altitude )+'m';
        if ( e.altitudeAccuracy ) {
            pMsg += ' (Accurate to '+e.altitudeAccuracy+'m)';
        }
    }
    floorplans.personMarker.setPopupContent(pMsg);
    /* only pan the map if the map hasn't been moved */
    if ( ! floorplans.recentreControl ) {
        floorplans.map.panTo( e.latlng );
    }
}
/**
 * Callback for the locationerror event of the map when the locate() method is
 * called.
 * @param {Error} e 
 */
function onLocationError(e) {
    activateGeolocation( false );
    toggleGeolocation( false );
}

/**
 * Toggle the disabled attribute of the geolocation control
 * @param {boolean} enable which way to toggle
 */
function toggleGeolocation( enable ) {
    if ( enable ) {
        document.querySelectorAll( '.geo-button' ).forEach( element => element.disabled = false );
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( element => element.disabled = true );
    }
}

/**
 * Toggle the active class of the geolocation control.
 * Also adds/removes the event listener to update the user's position
 * and adds / removes the person marker.
 * @param {boolean} activate which way to toggle
 */
function activateGeolocation( activate ) {
    if ( activate ) {
        document.querySelectorAll( '.geo-button' ).forEach( element => {
            element.classList.add( 'active' );
            element.setAttribute( 'aria-label', 'Stop using my location' );
            element.setAttribute( 'title', 'Stop using my location' );
        });
        floorplans.personMarker.addTo(floorplans.map).openPopup();
        floorplans.personCircle.addTo(floorplans.map);
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( element => {
            element.classList.remove( 'active' );
            element.setAttribute( 'aria-label', 'Use my location' );
            element.setAttribute( 'title', 'Use my location' );
        });
        floorplans.personMarker.remove();
        floorplans.personCircle.remove();
    }
}
