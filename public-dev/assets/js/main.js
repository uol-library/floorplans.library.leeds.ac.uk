import './modules/utilities.mjs';
import './modules/config.mjs';
import './modules/routing.mjs';
import './modules/selectercontrol.mjs';
import './modules/occupancycontrol.mjs';
import { initMap } from './modules/core.mjs';

document.addEventListener( 'DOMContentLoaded', () => {
    initMap();
});
